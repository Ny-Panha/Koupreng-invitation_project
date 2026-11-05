import { describe, expect, it } from "vitest";
import { formatAndRedactMetadata, redactDiagnosticValue, redactSecrets, sanitizePath } from "./auditSanitizer";

describe("auditSanitizer", () => {
  it.each(["guestToken", "Guest_Token", "access%5Ftoken", "%2574oken", "paymentReference", "transaction_id"])("redacts encoded and mixed-case query key %s", key => {
    expect(sanitizePath(`/api/guests?${key}=private-value&page=2#details`)).toBe(`/api/guests?${key}=[REDACTED]&page=2#details`);
  });

  it("scrubs nested secret containers and free-text values without hiding diagnostic keys", () => {
    const value = redactDiagnosticValue({
      apiKey: ["private-key"], credential: { value: "private-credential" },
      nested: [{ guestToken: 1234, note: "Failed /w/demo?GuestToken=private-guest&page=2", error: "Bearer private-bearer" }],
      keyboard: "Khmer", orderCode: "ORD-QA-1", durationMs: 14,
    });
    expect(value.apiKey).toBe("[REDACTED]");
    expect(value.credential).toBe("[REDACTED]");
    expect(value.nested[0].guestToken).toBe("[REDACTED]");
    expect(JSON.stringify(value)).not.toMatch(/private-|1234/);
    expect(value).toMatchObject({ keyboard: "Khmer", orderCode: "ORD-QA-1", durationMs: 14 });
    expect(value.nested[0].note).toContain("page=2");
  });

  it("redacts cookie, API key and quoted credential headers", () => {
    const value = redactSecrets("Cookie: session=private-cookie; csrf=private-csrf\nX-Api-Key: private-api\npassword='two word private password'");
    expect(value).not.toContain("private");
  });

  it("redacts a fully encoded guest URL and keeps harmless encoded paths intact", () => {
    expect(sanitizePath(encodeURIComponent("/w/demo?guestToken=private-value&page=2"))).not.toContain("private-value");
    expect(sanitizePath("/api/events?q=Khmer%20wedding&page=2")).toBe("/api/events?q=Khmer%20wedding&page=2");
  });

  it("redacts guest credentials in public path segments and structured API key headers", () => {
    expect(sanitizePath("/api/v1/public/invitations/fixture/guests/private-token/rsvp")).toBe("/api/v1/public/invitations/fixture/guests/[REDACTED]/rsvp");
    expect(sanitizePath("/api/v1/invitations/42/guests/501")).toBe("/api/v1/invitations/42/guests/501");
    expect(redactDiagnosticValue({ headers: { "X-Api-Key": ["private-api"] } })).toEqual({ headers: { "X-Api-Key": "[REDACTED]" } });
  });
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

