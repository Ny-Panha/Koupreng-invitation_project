package com.koupreng.backend.contact.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import com.koupreng.backend.contact.api.dto.ContactRequest;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.shared.security.RateLimitService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

class ContactServiceTests {
    @SuppressWarnings("unchecked")
    private final ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
    private final JavaMailSender mail = mock(JavaMailSender.class);
    private final RateLimitService limiter = mock(RateLimitService.class);
    private final ContactRequest request = new ContactRequest("Host", "host@example.test", "0123", "Wedding", "Please contact me.");

    @Test void successRequiresSmtpAcceptanceAndUsesOnlyConfiguredRecipient() {
        when(provider.getIfAvailable()).thenReturn(mail);
        var result = service("support@example.test").submit(request, "127.0.0.1");
        assertThat(result.accepted()).isTrue();
        assertThat(result.delivery()).isEqualTo("SMTP_ACCEPTED");
        ArgumentCaptor<SimpleMailMessage> sent = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mail).send(sent.capture());
        assertThat(sent.getValue().getTo()).containsExactly("support@example.test");
        assertThat(sent.getValue().getReplyTo()).isEqualTo(request.email());
        assertThat(sent.getValue().getText()).contains(request.name(), request.plan(), request.message());
    }

    @Test void missingConfigurationNeverAcknowledgesDelivery() {
        when(provider.getIfAvailable()).thenReturn(mail);
        assertStatus(() -> service("").submit(request, "127.0.0.1"), HttpStatus.SERVICE_UNAVAILABLE);
        when(provider.getIfAvailable()).thenReturn(null);
        assertStatus(() -> service("support@example.test").submit(request, "127.0.0.1"), HttpStatus.SERVICE_UNAVAILABLE);
        verifyNoInteractions(mail);
    }

    @Test void transportFailureReturnsSafeErrorWithoutPrivateTransportDetails() {
        when(provider.getIfAvailable()).thenReturn(mail);
        doThrow(new MailSendException("private transport diagnostic")).when(mail).send(any(SimpleMailMessage.class));
        assertThatThrownBy(() -> service("support@example.test").submit(request, "127.0.0.1"))
                .isInstanceOfSatisfying(ApiException.class, exception -> {
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.BAD_GATEWAY);
                    assertThat(exception.getMessage()).doesNotContain("private transport diagnostic");
                });
    }

    @Test void rateLimitRejectsBeforeAnyMailOperation() {
        doThrow(new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Slow down")).when(limiter).check(any(), anyInt(), any());
        assertStatus(() -> service("support@example.test").submit(request, "127.0.0.1"), HttpStatus.TOO_MANY_REQUESTS);
        verifyNoInteractions(provider, mail);
    }

    private ContactService service(String recipient) { return new ContactService(provider, limiter, recipient, "sender@example.test"); }
    private void assertStatus(org.assertj.core.api.ThrowableAssert.ThrowingCallable call, HttpStatus status) {
        assertThatThrownBy(call).isInstanceOfSatisfying(ApiException.class, e -> assertThat(e.getStatus()).isEqualTo(status));
    }
}
