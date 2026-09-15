package com.koupreng.backend.shared.security;

import com.koupreng.backend.payment.infrastructure.config.PaymentProperties;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AdminPaymentSecretFilterTests {

    @Test
    void blocksMissingSecretOnInternalPaymentEndpoint() throws Exception {
        AdminPaymentSecretFilter filter = filter();
        MockHttpServletRequest request = request("/api/v1/internal/template-payments/confirm");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean called = new AtomicBoolean();

        filter.doFilter(request, response, (servletRequest, servletResponse) -> called.set(true));

        assertEquals(401, response.getStatus());
        assertFalse(called.get());
    }

    @Test
    void blocksWrongSecretOnInternalPaymentEndpoint() throws Exception {
        AdminPaymentSecretFilter filter = filter();
        MockHttpServletRequest request = request("/api/v1/internal/template-payments/confirm");
        request.addHeader(AdminPaymentSecretFilter.ADMIN_PAYMENT_SECRET_HEADER, "wrong");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean called = new AtomicBoolean();

        filter.doFilter(request, response, (servletRequest, servletResponse) -> called.set(true));

        assertEquals(403, response.getStatus());
        assertFalse(called.get());
    }

    @Test
    void allowsCorrectSecretOnInternalPaymentEndpoint() throws Exception {
        AdminPaymentSecretFilter filter = filter();
        MockHttpServletRequest request = request("/api/v1/internal/template-payments/confirm");
        request.addHeader(AdminPaymentSecretFilter.ADMIN_PAYMENT_SECRET_HEADER, "secret");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean called = new AtomicBoolean();

        filter.doFilter(request, response, (servletRequest, servletResponse) -> called.set(true));

        assertEquals(200, response.getStatus());
        assertTrue(called.get());
    }

    @Test
    void ignoresNonPaymentAdminEndpoint() throws Exception {
        AdminPaymentSecretFilter filter = filter();
        MockHttpServletRequest request = request("/api/v1/invitations/my");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean called = new AtomicBoolean();

        filter.doFilter(request, response, (servletRequest, servletResponse) -> called.set(true));

        assertEquals(200, response.getStatus());
        assertTrue(called.get());
    }

    @Test
    void ignoresAdminPaymentListEndpoint() throws Exception {
        AdminPaymentSecretFilter filter = filter();
        MockHttpServletRequest request = request("GET", "/api/v1/admin/template-payments");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean called = new AtomicBoolean();

        filter.doFilter(request, response, (servletRequest, servletResponse) -> called.set(true));

        assertEquals(200, response.getStatus());
        assertTrue(called.get());
    }

    @Test
    void ignoresAdminPaymentPostEndpointSoAdminJwtCanAuthorizeIt() throws Exception {
        AdminPaymentSecretFilter filter = filter();
        MockHttpServletRequest request = request("/api/v1/admin/template-payments/confirm");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean called = new AtomicBoolean();

        filter.doFilter(request, response, (servletRequest, servletResponse) -> called.set(true));

        assertEquals(200, response.getStatus());
        assertTrue(called.get());
    }

    private AdminPaymentSecretFilter filter() {
        PaymentProperties properties = new PaymentProperties();
        properties.setAdminSecret("secret");
        return new AdminPaymentSecretFilter(properties);
    }

    private MockHttpServletRequest request(String path) {
        return request("POST", path);
    }

    private MockHttpServletRequest request(String method, String path) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.setRequestURI(path);
        return request;
    }
}
