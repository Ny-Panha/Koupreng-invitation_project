import { describe, expect, it } from "vitest";
import { formatAndRedactMetadata, redactSecrets, sanitizePath } from "./auditSanitizer";

describe("auditSanitizer", () => {
  it("redacts Bearer tokens in headers or strings", () => {
    const input = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secret";
    expect(redactSecrets(input)).toBe("Authorization: Bearer [REDACTED]");
  });

  it("redacts sensitive query parameters in URL paths", () => {
    const input = "/api/v1/invitations/rsvp?token=secret123&guestId=10&qrToken=pass999";
    expect(sanitizePath(input)).toBe(
      "/api/v1/invitations/rsvp?token=[REDACTED]&guestId=10&qrToken=[REDACTED]"
    );
  });

  it("redacts passwords and keys in JSON key-value pairs", () => {
    const input = '{"username": "admin", "password": "supersecretpassword", "token": "xyz123"}';
    const redacted = redactSecrets(input);
    expect(redacted).toContain('"password": "[REDACTED]"');
    expect(redacted).toContain('"token": "[REDACTED]"');
    expect(redacted).not.toContain("supersecretpassword");
  });

  it("parses and pretty formats metadata JSON while scrubbing sensitive keys", () => {
    const json = JSON.stringify({
      orderCode: "ORD-123",
      amount: 15.0,
      apiKey: "live_secret_key_888",
      nested: {
        authToken: "abc_token_999",
        safeNote: "Payment confirmed",
      },
    });

    const formatted = formatAndRedactMetadata(json);
    expect(formatted).toContain('"orderCode": "ORD-123"');
    expect(formatted).toContain('"apiKey": "[REDACTED]"');
    expect(formatted).toContain('"authToken": "[REDACTED]"');
    expect(formatted).toContain('"safeNote": "Payment confirmed"');
    expect(formatted).not.toContain("live_secret_key_888");
  });
});

