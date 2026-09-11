import { describe, expect, it } from "vitest";
import { buildTelegramOAuthUrl } from "./telegramOAuth";

describe("buildTelegramOAuthUrl", () => {
  it("includes the exact page origin required by Telegram", () => {
    const url = buildTelegramOAuthUrl("8707863405", {
      origin: "https://saxophone-padding-spooky.ngrok-free.dev",
      pathname: "/login",
    });

    expect(url.origin).toBe("https://oauth.telegram.org");
    expect(url.pathname).toBe("/auth");
    expect(url.searchParams.get("response_type")).toBe("post_message");
    expect(url.searchParams.get("client_id")).toBe("8707863405");
    expect(url.searchParams.get("origin")).toBe("https://saxophone-padding-spooky.ngrok-free.dev");
    expect(url.searchParams.get("redirect_uri")).toBe("https://saxophone-padding-spooky.ngrok-free.dev/login");
    expect(url.searchParams.get("scope")).toBe("openid profile telegram:bot_access");
  });
});
