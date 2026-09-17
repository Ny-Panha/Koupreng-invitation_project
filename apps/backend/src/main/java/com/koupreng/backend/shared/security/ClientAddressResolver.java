package com.koupreng.backend.shared.security;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Component;

@Component
public class ClientAddressResolver {

    private final ApiSecurityProperties apiSecurityProperties;

    public ClientAddressResolver(ApiSecurityProperties apiSecurityProperties) {
        this.apiSecurityProperties = apiSecurityProperties;
    }

    public String resolve(HttpServletRequest request) {
        if (apiSecurityProperties.getClientAddress().isForwardedHeadersEnabled()) {
            String forwardedFor = request.getHeader("X-Forwarded-For");
            String firstForwardedAddress = firstForwardedAddress(forwardedFor);
            if (!firstForwardedAddress.isBlank()) {
                return firstForwardedAddress;
            }

            String realIp = request.getHeader("X-Real-IP");
            if (realIp != null && !realIp.isBlank()) {
                return realIp.trim();
            }
        }

        String remoteAddress = request.getRemoteAddr();
        return remoteAddress == null || remoteAddress.isBlank() ? "unknown" : remoteAddress;
    }

    private String firstForwardedAddress(String forwardedFor) {
        if (forwardedFor == null || forwardedFor.isBlank()) {
            return "";
        }

        String first = forwardedFor.split(",", 2)[0].trim();
        return first.replace("[", "").replace("]", "");
    }
}
