package com.puspo.auth.serviceImpl;

import com.puspo.auth.client.AuthZServiceClient;
import com.puspo.auth.dto.auth.CreateStaffUserRequest;
import com.puspo.auth.dto.auth.FederatedUserNode;
import com.puspo.auth.dto.auth.LoginRequest;
import com.puspo.auth.dto.auth.LoginResponse;
import com.puspo.auth.dto.user.UserResponse;
import com.puspo.auth.entity.User;
import com.puspo.auth.entity.User.UserType;
import com.puspo.auth.repository.UserRepository;
import com.puspo.auth.service.AuthService;
import com.puspo.auth.service.UserIdService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final com.puspo.auth.security.JwtService jwtService;
    private final AuthZServiceClient authZServiceClient;
    private final UserIdService userIdService;

    @Override
    public Mono<LoginResponse> login(LoginRequest request) {
        return userRepository.findByUserId(request.getUserId())
                .switchIfEmpty(Mono.error(new RuntimeException("Invalid user ID or password")))
                .flatMap(user -> {
                    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        return Mono.error(new RuntimeException("Invalid user ID or password"));
                    }

                    var subjectId = user.getUserType() == UserType.CUSTOMER ? user.getCustomerId() : user.getId();
                    String subjectType = user.getUserType().name();

                    Mono<List<String>> rolesMono = authZServiceClient.getRolesForSubject(subjectId, subjectType)
                            .defaultIfEmpty(List.of());
                    Mono<List<String>> permissionsMono = authZServiceClient.getPermissionsForSubject(subjectId, subjectType)
                            .defaultIfEmpty(List.of());

                    return Mono.zip(rolesMono, permissionsMono)
                            .map(tuple -> buildLoginResponse(user, tuple.getT1(), tuple.getT2()));
                });
    }

    private LoginResponse buildLoginResponse(User user, List<String> roles, List<String> permissions) {
        var subjectId = user.getUserType() == UserType.CUSTOMER ? user.getCustomerId() : user.getId();
        String token = jwtService.generateToken(user.getId(), subjectId, user.getUserType().name(), roles);
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setId(user.getId());
        response.setUserId(user.getUserId());
        response.setUserType(user.getUserType().name());
        response.setCustomerId(user.getCustomerId());
        response.setRoles(roles);
        response.setPermissions(permissions);
        response.setExpiresInSeconds(jwtService.getExpirationSeconds());
        return response;
    }

    @Override
    public Mono<UserResponse> createStaffUser(CreateStaffUserRequest request) {
        // NOTE: temporarily unprotected so you can bootstrap your first SUPER_ADMIN.
        // Once at least one SUPER_ADMIN exists, this must be locked down (require
        // an existing SUPER_ADMIN's token) before this ever runs outside local dev.
        //
        // The login userId is generated right here, at creation — the staff member
        // can log in immediately. Roles/permissions are assigned separately and only
        // control what they can see after login.
        return userIdService.generate()
                .flatMap(generatedUserId -> {
                    User user = new User();
                    user.setUsername(request.getUsername());
                    user.setEmail(request.getEmail());
                    user.setPassword(passwordEncoder.encode(request.getPassword()));
                    user.setUserType(UserType.STAFF);
                    user.setCustomerId(null);
                    user.setUserId(generatedUserId);
                    user.setCreatedAt(LocalDateTime.now());
                    return userRepository.save(user);
                })
                .map(saved -> modelMapper.map(saved, UserResponse.class))
                .onErrorMap(DataIntegrityViolationException.class,
                        ex -> new RuntimeException("Username or email already exists"));
    }

    @Override
    public Mono<FederatedUserNode> me(UUID userId) {
        return userRepository.findById(userId)
                .map(user -> new FederatedUserNode(
                        user.getId().toString(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getUserType().name(),
                        user.getCustomerId() != null ? user.getCustomerId().toString() : null,
                        user.getUserId()))
                .switchIfEmpty(Mono.error(new RuntimeException("User not found")));
    }
}