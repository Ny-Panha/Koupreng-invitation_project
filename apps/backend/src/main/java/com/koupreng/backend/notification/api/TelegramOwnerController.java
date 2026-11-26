package com.koupreng.backend.notification.api;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.Hidden;
import com.koupreng.backend.notification.application.TelegramOwnerService;
import com.koupreng.backend.shared.response.ApiResponse;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/telegram/user")
public class TelegramOwnerController {
    private final TelegramOwnerService owners;

    public TelegramOwnerController(TelegramOwnerService owners) {
        this.owners = owners;
    }

    @GetMapping("/settings")
    public ApiResponse<TelegramOwnerService.Settings> settings(Authentication authentication) {
        return ApiResponse.success("Telegram settings", owners.settings(authentication));
    }

    @PostMapping("/link")
    public ResponseEntity<ApiResponse<TelegramOwnerService.ConnectLink>> link(Authentication authentication) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(ApiResponse.success("Telegram link created", owners.begin(authentication)));
    }

    @DeleteMapping("/link")
    public ResponseEntity<Void> disconnect(Authentication authentication) {
        owners.disconnect(authentication);
        return ResponseEntity.noContent().build();
    }

    @Hidden
    @PostMapping("/webhook")
    public Map<String, Object> webhook(
            @RequestHeader(value = "X-Telegram-Bot-Api-Secret-Token", required = false) String secret,
            @RequestBody JsonNode update) {
        return owners.receive(secret, update);
    }
}
