package com.puspo.auth.serviceImpl;

import com.puspo.auth.dto.registration.RegisterRequest;
import com.puspo.auth.dto.user.UserRequest;
import com.puspo.auth.dto.user.UserResponse;
import com.puspo.auth.entity.User;
import com.puspo.auth.exception.ResourceNotFoundException;
import com.puspo.auth.repository.UserRepository;
import com.puspo.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
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

    @Override
    public Mono<UserResponse> createUser(UserRequest request) {
        return userRepository.findByUsername(request.getUsername())
                .flatMap(existingUser -> Mono.<UserResponse>error(
                        new RuntimeException("Username already taken: " + request.getUsername())))
                .switchIfEmpty(Mono.defer(() -> {
                    User user = modelMapper.map(request, User.class);
                    user.setId(null);
                    user.setPassword(passwordEncoder.encode(request.getPassword()));
                    user.setCreatedAt(LocalDateTime.now());
                    return userRepository.save(user)
                            .map(saved -> modelMapper.map(saved, UserResponse.class));
                }))
                .onErrorMap(DataIntegrityViolationException.class,
                        ex -> new RuntimeException("Username or email already exists"));
    }

    @Override
    public Mono<UserResponse> register(RegisterRequest request) {
        return userRepository.existsByUsername(request.getUsername())
                .flatMap(usernameTaken -> {
                    if (Boolean.TRUE.equals(usernameTaken)) {
                        return Mono.error(new RuntimeException(
                                "Username already taken: " + request.getUsername()));
                    }
                    return userRepository.existsByEmail(request.getEmail());
                })
                .flatMap(emailTaken -> {
                    if (Boolean.TRUE.equals(emailTaken)) {
                        return Mono.<UserResponse>error(new RuntimeException(
                                "Email already registered: " + request.getEmail()));
                    }
                    User user = new User();
                    user.setUsername(request.getUsername());
                    user.setEmail(request.getEmail());
                    user.setPassword(passwordEncoder.encode(request.getPassword()));
                    user.setCreatedAt(LocalDateTime.now());
                    return userRepository.save(user)
                            .map(saved -> modelMapper.map(saved, UserResponse.class));
                })
                .onErrorMap(DataIntegrityViolationException.class,
                        ex -> new RuntimeException("Username or email already exists"));
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
}