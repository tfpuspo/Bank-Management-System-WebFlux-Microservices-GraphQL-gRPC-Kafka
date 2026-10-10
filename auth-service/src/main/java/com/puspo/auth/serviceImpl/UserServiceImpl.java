package com.puspo.auth.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.puspo.auth.dto.registration.RegisterRequest;
import com.puspo.auth.dto.user.UserRequest;
import com.puspo.auth.dto.user.UserResponse;
import com.puspo.auth.entity.OutboxEvent;
import com.puspo.auth.entity.User;
import com.puspo.auth.event.UserRegisteredPayload;
import com.puspo.auth.exception.ResourceNotFoundException;
import com.puspo.auth.repository.OutboxEventRepository;
import com.puspo.auth.repository.UserRepository;
import com.puspo.auth.service.UserIdService;
import com.puspo.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.reactive.TransactionalOperator;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;
    private final TransactionalOperator transactionalOperator;
    private final UserIdService userIdService;

    @Value("${app.kafka.topic.user-registered}")
    private String userRegisteredTopic;

    @Override
    public Mono<UserResponse> createUser(UserRequest request) {
        return userRepository.findByUsername(request.getUsername())
                .flatMap(existingUser -> Mono.<UserResponse>error(
                        new RuntimeException("Username already taken: " + request.getUsername())))
                .switchIfEmpty(Mono.defer(() -> userIdService.generate().flatMap(generatedUserId -> {
                    User user = modelMapper.map(request, User.class);
                    user.setId(null);
                    user.setPassword(passwordEncoder.encode(request.getPassword()));
                    user.setUserId(generatedUserId);
                    // This legacy endpoint has no userType in its input; without one the
                    // user could never log in, so default it to STAFF.
                    if (user.getUserType() == null) {
                        user.setUserType(User.UserType.STAFF);
                    }
                    user.setCreatedAt(LocalDateTime.now());
                    return userRepository.save(user)
                            .map(saved -> modelMapper.map(saved, UserResponse.class));
                })))
                .onErrorMap(DataIntegrityViolationException.class,
                        ex -> new RuntimeException("Username or email already exists"));
    }

    @Override
    public Mono<UserResponse> register(RegisterRequest request) {
        return userRepository.existsByCustomerId(request.getCustomerId())
                .flatMap(alreadyRegistered -> {
                    if (Boolean.TRUE.equals(alreadyRegistered)) {
                        return Mono.<Boolean>error(new RuntimeException(
                                "This customer is already registered. Please log in with your User ID."));
                    }
                    return userRepository.existsByUsername(request.getUsername());
                })
                .flatMap(usernameTaken -> {
                    if (Boolean.TRUE.equals(usernameTaken)) {
                        return Mono.<Boolean>error(new RuntimeException(
                                "Username already taken: " + request.getUsername()));
                    }
                    return userRepository.existsByEmail(request.getEmail());
                })
                .flatMap(emailTaken -> {
                    if (Boolean.TRUE.equals(emailTaken)) {
                        return Mono.<UserResponse>error(new RuntimeException(
                                "Email already registered: " + request.getEmail()));
                    }

                    // The login userId is generated as part of registration itself and
                    // saved in the same insert, together with the outbox event, in one
                    // transaction.
                    return userIdService.generate()
                            .flatMap(generatedUserId -> {
                                User user = new User();
                                user.setUsername(request.getUsername());
                                user.setEmail(request.getEmail());
                                user.setPassword(passwordEncoder.encode(request.getPassword()));
                                user.setCustomerId(request.getCustomerId());
                                user.setUserType(User.UserType.CUSTOMER);
                                user.setUserId(generatedUserId);
                                user.setCreatedAt(LocalDateTime.now());

                                return userRepository.save(user)
                                        .flatMap(saved -> saveUserRegisteredEvent(saved).thenReturn(saved))
                                        .as(transactionalOperator::transactional);
                            })
                            .map(saved -> modelMapper.map(saved, UserResponse.class));
                })
                .onErrorMap(DataIntegrityViolationException.class,
                        ex -> new RuntimeException("This customer, username or email is already registered"));
    }

    @Override
    public Mono<UserResponse> getUserById(UUID id) {
        return userRepository.findById(id)
                .map(user -> modelMapper.map(user, UserResponse.class))
                .switchIfEmpty(Mono.error(new RuntimeException("User not found with id: " + id)));
    }

    @Override
    public Mono<UserResponse> getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(user -> modelMapper.map(user, UserResponse.class))
                .switchIfEmpty(Mono.error(new ResourceNotFoundException(
                        "User not found with username: " + username)));
    }

    @Override
    public Flux<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .map(user -> modelMapper.map(user, UserResponse.class));
    }

    private Mono<OutboxEvent> saveUserRegisteredEvent(User user) {
        UserRegisteredPayload payload = new UserRegisteredPayload(
                user.getId().toString(), user.getCustomerId(), user.getUsername(), user.getEmail(),
                user.getUserId());
        return Mono.fromCallable(() -> objectMapper.writeValueAsString(payload))
                .flatMap(json -> {
                    OutboxEvent event = new OutboxEvent();
                    event.setAggregateId(user.getCustomerId());
                    event.setAggregateType("USER");
                    event.setEventType("UserRegistered");
                    event.setTopic(userRegisteredTopic);
                    event.setPayload(json);
                    event.setCreatedAt(LocalDateTime.now());
                    return outboxEventRepository.save(event);
                });
    }
}