package com.koupreng.backend.contact.api;

import com.koupreng.backend.contact.api.dto.ContactRequest;
import com.koupreng.backend.contact.application.ContactService;
import com.koupreng.backend.shared.response.ApiResponse;
import com.koupreng.backend.shared.security.ClientAddressResolver;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/contact")
@Tag(name = "Contact", description = "Validated and rate-limited contact delivery.")
public class ContactController {
    private final ContactService contactService;
    private final ClientAddressResolver clientAddressResolver;

    public ContactController(ContactService contactService, ClientAddressResolver clientAddressResolver) {
        this.contactService = contactService;
        this.clientAddressResolver = clientAddressResolver;
    }

    @PostMapping
    @Operation(summary = "Send a contact request", description = "Success means SMTP accepted the message, not inbox delivery.")
    public ApiResponse<ContactService.ContactDelivery> submit(@Valid @RequestBody ContactRequest request,
                                                            HttpServletRequest httpRequest) {
        return ApiResponse.success("Contact request accepted by the mail server",
                contactService.submit(request, clientAddressResolver.resolve(httpRequest)));
    }
}
