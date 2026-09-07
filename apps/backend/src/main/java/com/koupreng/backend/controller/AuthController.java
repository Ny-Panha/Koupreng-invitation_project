package com.koupreng.backend.controller;

import com.koupreng.backend.common.ApiErrorResponse;
import jakarta.validation.Valid;

import com.koupreng.backend.dto.AuthResponse;
import com.koupreng.backend.dto.ChangePasswordRequest;
import com.koupreng.backend.dto.ForgotPasswordRequest;
import com.koupreng.backend.dto.GoogleLoginRequest;
import com.koupreng.backend.dto.LoginRequest;
import com.koupreng.backend.dto.MessageResponse;
import com.koupreng.backend.dto.RegisterRequest;
import com.koupreng.backend.dto.ResetPasswordRequest;
import com.koupreng.backend.dto.TelegramLoginRequest;
import com.koupreng.backend.dto.UpdateProfileRequest;
import com.koupreng.backend.dto.UserResponse;
import com.koupreng.backend.security.AuthCookieService;
import com.koupreng.backend.service.AccountService;
import com.koupreng.backend.service.AuthService;
import com.koupreng.backend.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Registration, login, social identity, token invalidation, and account recovery.")
public class AuthController {

    private final AuthService authService;
    private final AccountService accountService;
    private final UserService userService;
    private final AuthCookieService authCookieService;

    public AuthController(
            AuthService authService,
            AccountService accountService,
            UserService userService,
            AuthCookieService authCookieService
    ) {
        this.authService = authService;
        this.accountService = accountService;
        this.userService = userService;
        this.authCookieService = authCookieService;
    }

    @Operation(summary = "Register a user account",
            description = "Create an account and return a JWT accessToken for the new user.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation or password policy failure",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email address or phone number already registered",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Registration attempt limit exceeded",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return withAuthCookie(authService.register(request));
    }

    @Operation(summary = "Log in with email or phone",
            description = "Return the accessToken used with Swagger Authorize. Paste only the JWT; Swagger adds Bearer automatically.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Malformed or invalid request",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials or disabled account",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Login attempt limit exceeded",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return withAuthCookie(authService.login(request));
    }

    @Operation(summary = "Log in with Google", description = "Verify a Google ID token and return a Koupreng JWT.")
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return withAuthCookie(authService.loginWithGoogle(request));
    }

    @Operation(summary = "Log in with Telegram",
            description = "Verify a Telegram OIDC token or legacy login-widget payload and return a Koupreng JWT.")
    @PostMapping("/telegram")
    public ResponseEntity<AuthResponse> loginWithTelegram(@Valid @RequestBody TelegramLoginRequest request) {
        return withAuthCookie(authService.loginWithTelegram(request));
    }

    @Operation(summary = "Log out", description = "Invalidate existing JWTs for the current user and clear the optional auth cookie.")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(Authentication authentication) {
        authService.logout(authentication);
        ResponseEntity.BodyBuilder response = ResponseEntity.ok();
        authCookieService.clearAuthCookie()
                .map(ResponseCookie::toString)
                .ifPresent(cookie -> response.header(HttpHeaders.SET_COOKIE, cookie));
        return response.body(new MessageResponse("Logged out"));
    }

    @Operation(summary = "Get the current user profile")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return userService.getProfile(authentication);
    }

    @Operation(summary = "Update the current user profile")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/me")
    public UserResponse updateMe(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return userService.updateProfile(authentication, request);
    }

    @Operation(summary = "Change the current user password",
            description = "Validate the current password, set a new password, and invalidate existing JWTs.")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/change-password")
    public MessageResponse changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        accountService.changePassword(authentication, request);
        return new MessageResponse("Password changed successfully");
    }

    @Operation(summary = "Request password reset instructions",
            description = "Always return a neutral response so account existence is not disclosed.")
    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        accountService.forgotPassword(request);
        return new MessageResponse("If the email exists, password reset instructions will be sent");
    }

    @Operation(summary = "Reset a password",
            description = "Consume a valid single-use reset token and invalidate existing JWTs.")
    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        accountService.resetPassword(request);
        return new MessageResponse("Password reset successfully");
    }

    private ResponseEntity<AuthResponse> withAuthCookie(AuthResponse authResponse) {
        ResponseEntity.BodyBuilder response = ResponseEntity.ok();
        authCookieService.createAuthCookie(authResponse)
                .map(ResponseCookie::toString)
                .ifPresent(cookie -> response.header(HttpHeaders.SET_COOKIE, cookie));
        return response.body(authResponse);
    }
}
