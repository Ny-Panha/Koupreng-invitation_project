export const TELEGRAM_OAUTH_ORIGIN = "https://oauth.telegram.org";

export function buildTelegramOAuthUrl(clientId, location = window.location) {
  const redirectUri = `${location.origin}${location.pathname}`;
  const authUrl = new URL("/auth", TELEGRAM_OAUTH_ORIGIN);

  authUrl.searchParams.set("response_type", "post_message");
  authUrl.searchParams.set("client_id", String(clientId));
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("origin", location.origin);
  authUrl.searchParams.set("scope", "openid profile telegram:bot_access");
  authUrl.searchParams.set("lang", "en");

  return authUrl;
}
