package com.koupreng.backend.contact.application;

import com.koupreng.backend.contact.api.dto.ContactRequest;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.shared.security.RateLimitService;
import java.time.Duration;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class ContactService {
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final RateLimitService rateLimitService;
    private final String recipient;
    private final String sender;

    public ContactService(ObjectProvider<JavaMailSender> mailSenderProvider, RateLimitService rateLimitService,
                          @Value("${app.contact.recipient:}") String recipient,
                          @Value("${app.contact.sender:}") String sender) {
        this.mailSenderProvider = mailSenderProvider;
        this.rateLimitService = rateLimitService;
        this.recipient = recipient == null ? "" : recipient.trim();
        this.sender = sender == null ? "" : sender.trim();
    }

    public ContactDelivery submit(ContactRequest request, String clientAddress) {
        rateLimitService.check("contact:" + clientAddress, 5, Duration.ofMinutes(15));
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null || recipient.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "CONTACT_UNCONFIGURED",
                    "Contact delivery is unavailable. Please use the listed contact details.");
        }
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(recipient);
        if (!sender.isBlank()) {
            mail.setFrom(sender);
        }
        mail.setReplyTo(request.email());
        mail.setSubject("E-Invitation contact request");
        mail.setText("Name: " + request.name() + "\nEmail: " + request.email()
                + "\nPhone: " + value(request.phone()) + "\nPlan: " + value(request.plan())
                + "\n\n" + request.message());
        try {
            mailSender.send(mail);
        } catch (MailException exception) {
            // Transport errors can include private addresses or credentials; expose no raw detail.
            throw new ApiException(HttpStatus.BAD_GATEWAY, "CONTACT_DELIVERY_FAILED",
                    "Contact delivery failed. Please try again or use the listed contact details.");
        }
        return new ContactDelivery(true, "SMTP_ACCEPTED");
    }

    private String value(String text) {
        return text == null ? "" : text;
    }

    public record ContactDelivery(boolean accepted, String delivery) { }
}
