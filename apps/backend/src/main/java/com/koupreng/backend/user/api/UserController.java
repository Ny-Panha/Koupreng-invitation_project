package com.koupreng.backend.user.api;

import java.util.Map;

import com.koupreng.backend.auth.api.dto.ChangePasswordRequest;
import com.koupreng.backend.auth.application.AccountService;
import com.koupreng.backend.user.api.dto.UpdateProfileRequest;
import com.koupreng.backend.user.api.dto.UserResponse;
import com.koupreng.backend.user.application.UserService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Validated
@RequestMapping({"/api/v1/users/me", "/api/users/me"})
@Tag(name = "Users", description = "Current-user profile, password, and validated profile-image operations.")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;
    private final AccountService accountService;

    public UserController(
            UserService userService,
            AccountService accountService
    ) {
        this.userService = userService;
        this.accountService = accountService;
    }

    @GetMapping
    public UserResponse getProfile(Authentication authentication) {
        return userService.getProfile(authentication);
    }

    @PatchMapping
    public UserResponse updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return userService.updateProfile(authentication, request);
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        accountService.changePassword(authentication, request);
    }

    @PostMapping(value = "/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadProfileImage(
            Authentication authentication,
            @org.springframework.web.bind.annotation.RequestParam("file") MultipartFile file
    ) {
        return Map.of("url", userService.uploadProfileImage(file));
    }
}
