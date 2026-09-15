package com.koupreng.backend.security;

import java.util.List;

import com.koupreng.backend.shared.exception.ApiException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.HandlerInterceptor;

public class FileUploadValidationInterceptor implements HandlerInterceptor {

    private final ApiSecurityProperties.Upload properties;
    private final FileUploadValidator validator;

    public FileUploadValidationInterceptor(
            ApiSecurityProperties apiSecurityProperties,
            FileUploadValidator validator
    ) {
        this.properties = apiSecurityProperties.getUpload();
        this.validator = validator;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!properties.isEnabled() || !(request instanceof MultipartHttpServletRequest multipartRequest)) {
            return true;
        }

        int fileCount = 0;
        for (List<MultipartFile> files : multipartRequest.getMultiFileMap().values()) {
            fileCount += files.size();
            if (fileCount > properties.getMaxFiles()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Too many uploaded files");
            }

            for (MultipartFile file : files) {
                validator.validate(file);
                if (request.getRequestURI().endsWith("/profile-image")) {
                    validator.requireImage(file);
                }
            }
        }

        return true;
    }
}
