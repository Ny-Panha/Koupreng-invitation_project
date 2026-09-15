package com.koupreng.backend.shared.security;

import com.koupreng.backend.media.infrastructure.config.StorageProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class ApiWebMvcConfig implements WebMvcConfigurer {

    private final ApiSecurityProperties apiSecurityProperties;
    private final FileUploadValidator fileUploadValidator;
    private final StorageProperties storageProperties;

    public ApiWebMvcConfig(
            ApiSecurityProperties apiSecurityProperties,
            FileUploadValidator fileUploadValidator,
            StorageProperties storageProperties
    ) {
        this.apiSecurityProperties = apiSecurityProperties;
        this.fileUploadValidator = fileUploadValidator;
        this.storageProperties = storageProperties;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new FileUploadValidationInterceptor(apiSecurityProperties, fileUploadValidator))
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/v1/invitations/*/media/**",
                        "/api/v1/invitations/*/guests/import-file"
                );
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadRoot = Path.of(storageProperties.getLocal().getUploadDir()).toAbsolutePath().normalize();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadRoot.toUri().toString() + "/");
    }
}
