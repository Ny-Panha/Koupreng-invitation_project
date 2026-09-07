package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import com.koupreng.backend.dto.ChangePasswordRequest;
import com.koupreng.backend.dto.UpdateProfileRequest;
import com.koupreng.backend.dto.UserResponse;
import com.koupreng.backend.security.FileUploadValidator;
import com.koupreng.backend.service.AccountService;
import com.koupreng.backend.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import com.koupreng.backend.service.storage.StorageService;
import com.koupreng.backend.service.storage.StorageUploadResult;

@RestController
@Validated
@RequestMapping("/api/users/me")
@Tag(name = "Users", description = "Current-user profile, password, and validated profile-image operations.")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;
    private final AccountService accountService;
    private final StorageService storageService;
    private final FileUploadValidator fileUploadValidator;

    public UserController(
            UserService userService,
            AccountService accountService,
            StorageService storageService,
            FileUploadValidator fileUploadValidator
    ) {
        this.userService = userService;
        this.accountService = accountService;
        this.storageService = storageService;
        this.fileUploadValidator = fileUploadValidator;
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
        // Validate image at controller level as defense-in-depth
        fileUploadValidator.requireImage(file);
        // We use PROFILE_IMAGE media type and 0L for invitationId since it's a user profile image
        StorageUploadResult result = storageService.upload(file, com.koupreng.backend.enums.MediaType.PROFILE_IMAGE, 0L);
        return Map.of("url", result.fileUrl());
    }
}
