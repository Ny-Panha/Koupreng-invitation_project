import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import authService from "@/features/auth/api/authApi";
import { buildTelegramOAuthUrl, TELEGRAM_OAUTH_ORIGIN } from "./telegramOAuth";

const isDev = import.meta.env.DEV;

function debugSocialAuth(message, details) {
  if (!isDev) return;
  if (details === undefined) {
    console.debug(`[social-auth] ${message}`);
  } else {
    console.debug(`[social-auth] ${message}`, details);
  }
}

function normalizeEnvValue(value) {
  return String(value || "").trim();
}

function isPlaceholder(value) {
  const normalized = normalizeEnvValue(value).toLowerCase();
  return !normalized
    || normalized.startsWith("your_")
    || normalized.startsWith("your-")
    || normalized.includes("replace_with")
    || normalized.includes("replace-me")
    || normalized.includes("replace_me")
    || normalized.includes("change_me")
    || normalized.includes("change-me")
    || normalized === "null"
    || normalized === "undefined"
    || normalized.includes("example");
}

function isGoogleClientId(value) {
  return Boolean(value) && !isPlaceholder(value) && /\.apps\.googleusercontent\.com$/.test(value);
}

function isNumericId(value) {
  return /^\d+$/.test(value);
}

/* ─── env values ─────────────────────────────────────────── */
const rawGoogleClientId = normalizeEnvValue(import.meta.env.VITE_GOOGLE_CLIENT_ID);
const googleClientId = isGoogleClientId(rawGoogleClientId) ? rawGoogleClientId : "";
// Numeric Telegram Login client ID from BotFather. For existing bots this is
// commonly the bot ID, so keep VITE_TELEGRAM_BOT_ID as a migration fallback.
const configuredTelegramClientId = normalizeEnvValue(import.meta.env.VITE_TELEGRAM_CLIENT_ID);
const telegramBotId = normalizeEnvValue(import.meta.env.VITE_TELEGRAM_BOT_ID);
const telegramClientId = isNumericId(configuredTelegramClientId)
  ? configuredTelegramClientId
  : telegramBotId;
const rawBotUsername = normalizeEnvValue(import.meta.env.VITE_TELEGRAM_BOT_USERNAME);
const telegramBot = isPlaceholder(rawBotUsername) ? "" : rawBotUsername.replace(/^@/, "");
const publicAppUrl = normalizeEnvValue(import.meta.env.VITE_PUBLIC_APP_URL);

// OIDC flow: needs the numeric client ID shown by BotFather's Login Widget.
const hasTelegramClientId = isNumericId(telegramClientId);
// Widget iframe flow: needs bot username + BotFather /setdomain configured
const hasTelegramBot = Boolean(telegramBot);
const hasPublicAppUrl = Boolean(publicAppUrl) && Boolean(normalizeOrigin(publicAppUrl));
const TELEGRAM_CONFIG_ERROR = "មុខងារ Login ជាមួយ Telegram មិនទាន់បើកដំណើរការទេ សូមចូលដោយប្រើលេខទូរស័ព្ទ ឬ Email";
const GOOGLE_CONFIG_ERROR = "មុខងារ Login ជាមួយ Google មិនទាន់បើកដំណើរការទេ សូមចូលដោយប្រើលេខទូរស័ព្ទ ឬ Email";

const GOOGLE_GSI_ID = "google-gsi-script";
const TELEGRAM_LOGIN_ID = "telegram-login-script";
const TELEGRAM_LOGIN_SCRIPT_SRC = "https://oauth.telegram.org/js/telegram-login.js?6";
const TELEGRAM_WIDGET_SCRIPT_SRC = "https://telegram.org/js/telegram-widget.js?22";

/* ─── Icons ──────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#229ED9" />
      <path d="M17.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.07-.18c-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.2 3.45-.49.34-.94.5-1.35.49-.45-.01-1.32-.26-1.96-.47-.79-.26-1.42-.39-1.37-.83.03-.22.33-.44.91-.68 3.56-1.55 5.94-2.58 7.12-3.07 3.39-1.41 4.1-1.65 4.56-1.66.1 0 .32.02.46.12.12.09.15.22.16.32.01.07.02.16.02.24z" fill="white" />
    </svg>
  );
}

/* ─── Script loader ──────────────────────────────────────── */
function loadScript(id, src, isReady = () => false) {
  const existing = document.getElementById(id);
  if (existing) {
    if (existing.dataset.src !== src) {
      existing.remove();
    } else if (existing.dataset.loaded || isReady()) {
      return Promise.resolve();
    } else {
      return new Promise((res, rej) => {
        existing.addEventListener("load", res, { once: true });
        existing.addEventListener("error", rej, { once: true });
      });
    }
  }

  if (isReady()) return Promise.resolve();

  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.id = id; s.src = src; s.async = true; s.dataset.src = src;
    s.onload = () => { s.dataset.loaded = "1"; res(); };
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

function loadTelegramLoginScript() {
  return loadScript(
    TELEGRAM_LOGIN_ID,
    TELEGRAM_LOGIN_SCRIPT_SRC,
    () => Boolean(window.Telegram?.Login?.auth),
  );
}

function normalizeOrigin(value) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

function isLocalOrigin(origin) {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function configuredTelegramOrigin() {
  const configuredOrigin = normalizeOrigin(publicAppUrl);
  if (!configuredOrigin) {
    return window.location.origin;
  }

  if (isLocalOrigin(configuredOrigin) && !isLocalOrigin(window.location.origin)) {
    return window.location.origin;
  }

  return configuredOrigin;
}

function redirectToTelegramOrigin() {
  const targetOrigin = configuredTelegramOrigin();
  if (targetOrigin === window.location.origin) {
    return false;
  }

  debugSocialAuth("redirecting to configured Telegram origin", {
    currentOrigin: window.location.origin,
    targetOrigin,
  });
  const target = new URL(window.location.pathname + window.location.search, targetOrigin);
  window.location.assign(target.toString());
  return true;
}

function prepareTelegramOrigin(setError) {
  if (redirectToTelegramOrigin()) {
    return false;
  }

  if (isLocalOrigin(window.location.origin)) {
    setError("Telegram Login តម្រូវឱ្យមាន HTTPS Domain (ឬ Ngrok Tunnel) ព្រោះ Telegram Policy មិនអនុញ្ញាតលើ localhost ផ្ទាល់ទេ។ សម្រាប់ Localhost សូមប្រើ Google Login ឬ Email/Password។");
    return false;
  }

  return true;
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
}

function normalizeTelegramUser(user) {
  return {
    id: user.id,
    first_name: user.first_name ?? user.firstName,
    last_name: user.last_name ?? user.lastName,
    username: user.username,
    photo_url: user.photo_url ?? user.photoUrl,
    auth_date: user.auth_date ?? user.authDate,
    hash: user.hash,
  };
}

function isLegacyTelegramPayload(value) {
  return Boolean(value?.id && (value.auth_date || value.authDate) && value.hash);
}

function telegramAuthResult(data) {
  if (data?.error) {
    return { error: data.error };
  }

  const result = data?.result ?? data?.user ?? data;
  if (typeof result === "string") {
    debugSocialAuth("Telegram returned an ID token");
    return {
      loginData: { idToken: result },
      user: decodeJwtPayload(result),
    };
  }

  if (result?.id_token && typeof result.id_token === "string") {
    debugSocialAuth("Telegram returned an OIDC id_token");
    return {
      loginData: { idToken: result.id_token },
      user: decodeJwtPayload(result.id_token),
    };
  }

  if (isLegacyTelegramPayload(result)) {
    debugSocialAuth("Telegram returned legacy widget data");
    return {
      loginData: normalizeTelegramUser(result),
      user: result,
    };
  }

  return { error: "Telegram did not return usable login data." };
}

function isTelegramInAppBrowser() {
  return Boolean(
    window.TelegramWebviewProxy
    || window.TelegramWebviewProxyProto
    || window.TelegramGameProxy,
  );
}

function openTelegramBrowserLogin(clientId, onResult, onError) {
  const authUrl = buildTelegramOAuthUrl(clientId);
  debugSocialAuth("opening Telegram browser login", {
    clientIdConfigured: Boolean(clientId),
    origin: authUrl.searchParams.get("origin"),
    redirectUri: authUrl.searchParams.get("redirect_uri"),
  });

  const width = 550;
  const height = 650;
  const left = Math.max(0, (window.screen.width - width) / 2) + (window.screen.availLeft || 0);
  const top = Math.max(0, (window.screen.height - height) / 2) + (window.screen.availTop || 0);
  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    "status=0",
    "location=0",
    "menubar=0",
    "toolbar=0",
  ].join(",");

  let popup = null;
  let finished = false;
  let closeTimer = null;

  const cleanup = () => {
    window.removeEventListener("message", handleMessage);
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
  };

  const finish = (handler) => {
    if (finished) return;
    finished = true;
    cleanup();
    handler();
  };

  const checkClose = () => {
    if (!popup || popup.closed) {
      finish(() => onError(new Error("Telegram login popup was closed.")));
      return;
    }
    closeTimer = window.setTimeout(checkClose, 200);
  };

  function handleMessage(event) {
    if (event.origin !== TELEGRAM_OAUTH_ORIGIN || event.source !== popup) {
      return;
    }

    let data = event.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        return;
      }
    }

    if (data?.event !== "auth_result") {
      return;
    }

    const result = telegramAuthResult(data);
    if (result?.error) {
      finish(() => onError(new Error(result.error)));
      return;
    }

    finish(() => onResult(result));
  }

  try {
    window.addEventListener("message", handleMessage);
    popup = window.open(authUrl.toString(), "telegram_oidc_login", features);
    if (!popup) {
      finish(() => onError(new Error("Telegram login popup was blocked.")));
      return;
    }
    popup.focus();
    checkClose();
  } catch (error) {
    finish(() => onError(error));
  }
}

function openTelegramSdkLogin(clientId, onResult, onError) {
  if (!window.Telegram?.Login?.auth) {
    onError(new Error("Telegram login script is not ready."));
    return;
  }

  try {
    debugSocialAuth("opening Telegram login popup", {
      clientIdConfigured: Boolean(clientId),
      origin: window.location.origin,
    });
    window.Telegram.Login.auth(
      { client_id: Number(clientId), scope: ["profile", "write"], lang: "en" },
      (authData) => {
        const result = telegramAuthResult(authData);
        if (result?.error) {
          onError(new Error(result.error));
          return;
        }
        onResult(result);
      },
    );
  } catch (error) {
    onError(error);
  }
}

function openTelegramLogin(clientId, onResult, onError) {
  if (isTelegramInAppBrowser()) {
    openTelegramSdkLogin(clientId, onResult, onError);
    return;
  }

  openTelegramBrowserLogin(clientId, onResult, onError);
}

/* ─── Main component ─────────────────────────────────────── */
export default function SocialAuthButtons({ redirectTo = "/dashboard" }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [telegramReady, setTelegramReady] = useState(
    !hasTelegramClientId || !isTelegramInAppBrowser(),
  );
  const telegramMode = hasTelegramClientId ? "oidc" : hasTelegramBot ? "widget" : "none";

  // Telegram widget iframe (legacy — needs BotFather /setdomain)
  const widgetHostRef = useRef(null);

  /* ── Telegram's in-app browser needs its SDK. Regular browsers use the
     explicit-origin popup above because the SDK currently omits origin. ── */
  useEffect(() => {
    if (telegramMode !== "oidc" || !isTelegramInAppBrowser()) return undefined;

    let cancelled = false;
    loadTelegramLoginScript()
      .then(() => {
        if (!cancelled) setTelegramReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Telegram login script failed to load. Check your network and allowed URL settings.");
        }
      });

    return () => { cancelled = true; };
  }, [telegramMode]);

  /* ── Load Telegram legacy widget (bot username, no ID) ── */
  useEffect(() => {
    if (telegramMode !== "widget") return undefined;
    if (isLocalOrigin(window.location.origin)) return undefined;
    const host = widgetHostRef.current;
    if (!host) return undefined;
    debugSocialAuth("loading Telegram widget", { botUsernameConfigured: Boolean(telegramBot) });

    const cbName = "_kouprengTgWidgetAuth";
    window[cbName] = async (user) => {
      setError(""); setBusy("telegram");
      try {
        const data = await authService.loginWithTelegram({
          id: user.id, first_name: user.first_name, last_name: user.last_name,
          username: user.username, photo_url: user.photo_url,
          auth_date: user.auth_date, hash: user.hash,
        });
        login(data);
        navigate(redirectTo, { replace: true });
      } catch (e) {
        setError(e.message || "Telegram login failed.");
      } finally { setBusy(""); }
    };

    const script = document.createElement("script");
    script.src = TELEGRAM_WIDGET_SCRIPT_SRC;
    script.async = true;
    script.setAttribute("data-telegram-login", telegramBot);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "10");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", `${cbName}(user)`);
    script.onerror = () => setError("Telegram widget failed to load.");
    host.innerHTML = "";
    host.appendChild(script);

    return () => { delete window[cbName]; if (host) host.innerHTML = ""; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── shared completeLogin ── */
  const completeLogin = useCallback(async (providerFn) => {
    setError("");
    try {
      const data = await providerFn();
      debugSocialAuth("social login completed", {
        hasAccessToken: Boolean(data?.accessToken),
        hasUser: Boolean(data?.user),
      });
      login(data); navigate(redirectTo, { replace: true });
    } catch (e) {
      setError(e.message || "Login failed.");
    } finally { setBusy(""); }
  }, [login, navigate, redirectTo]);

  /* ── Telegram OAuth click (numeric client_id flow) ── */
  const handleTelegramOidc = useCallback(() => {
    if (busy) return;
    setBusy("telegram"); setError("");

    if (!hasTelegramClientId) {
      setError(TELEGRAM_CONFIG_ERROR);
      setBusy("");
      return;
    }

    if (!hasPublicAppUrl && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      debugSocialAuth("VITE_PUBLIC_APP_URL is not configured for Telegram on a non-local origin");
    }

    if (!prepareTelegramOrigin(setError)) {
      setBusy("");
      return;
    }

    if (!telegramReady) {
      setError("Telegram login is still loading. Please try again in a moment.");
      setBusy("");
      return;
    }

    openTelegramLogin(
      telegramClientId,
      (data) => {
        completeLogin(() => authService.loginWithTelegram(data.loginData));
      },
      (err) => { setError(err.message || "Telegram login failed."); setBusy(""); },
    );
  }, [busy, completeLogin, telegramReady]);

  /* ─── Render ─────────────────────────────────────────────── */
  useEffect(() => {
    debugSocialAuth("configuration", {
      googleConfigured: Boolean(googleClientId),
      telegramMode,
      publicAppUrlConfigured: hasPublicAppUrl,
    });
  }, [telegramMode]);

  return (
    <>
      <div className="auth-socials">

        {/* Google */}
        {googleClientId ? (
          <GoogleSignInButton
            clientId={googleClientId}
            onSuccess={(credential) => completeLogin(() => authService.loginWithGoogle(credential))}
            onError={setError}
            busy={busy === "google"}
            onBusyChange={(v) => setBusy(v ? "google" : "")}
          />
        ) : (
          <button
            type="button"
            className="auth-social-btn google"
            onClick={() => setError(GOOGLE_CONFIG_ERROR)}
          >
            <GoogleIcon /> បន្តជាមួយ Google
          </button>
        )}

        {/* Telegram — OAuth/OIDC popup (client_id known) */}
        {telegramMode === "oidc" && (
          <button
            type="button"
            className="auth-social-btn telegram"
            onClick={handleTelegramOidc}
            disabled={busy === "telegram" || !telegramReady}
          >
            <TelegramIcon />
            {!telegramReady ? "Loading Telegram…" : busy === "telegram" ? "Logging in…" : "បន្តជាមួយ Telegram"}
          </button>
        )}

        {/* Telegram — legacy widget iframe (bot username only) */}
        {telegramMode === "widget" && (
          isLocalOrigin(window.location.origin) ? (
            <button
              type="button"
              className="auth-social-btn telegram"
              onClick={() => {
                setBusy("telegram");
                setError("");
                if (!prepareTelegramOrigin(setError)) {
                  setBusy("");
                }
              }}
              disabled={busy === "telegram"}
            >
              <TelegramIcon />
              {busy === "telegram" ? "Logging in…" : "បន្តជាមួយ Telegram"}
            </button>
          ) : (
            <div className="auth-social-widget-tg">
              <div ref={widgetHostRef} className="auth-tg-iframe-host" />
              <div className="auth-social-btn telegram auth-tg-fake-btn" aria-hidden="true">
                <TelegramIcon />
                {busy === "telegram" ? "Logging in…" : "បន្តជាមួយ Telegram"}
              </div>
            </div>
          )
        )}

        {/* Telegram — not configured */}
        {telegramMode === "none" && (
          <button
            type="button"
            className="auth-social-btn telegram"
            onClick={() => setError(TELEGRAM_CONFIG_ERROR)}
          >
            <TelegramIcon /> បន្តជាមួយ Telegram
          </button>
        )}

      </div>

      {busy && <p className="auth-hint">Completing {busy} login…</p>}
      {error && (
        <div className="auth-error mt-2">
          {error}
        </div>
      )}
    </>
  );
}

/* ─── GoogleSignInButton ─────────────────────────────────────
   Google requires the visible button rendered by its Identity Services SDK.
──────────────────────────────────────────────────────────── */
function GoogleSignInButton({ clientId, onSuccess, onError, busy, onBusyChange }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    function init() {
      if (cancelled || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response?.credential) { onError("Google did not return a credential."); return; }
          debugSocialAuth("Google returned an ID token credential");
          onBusyChange(true);
          try { await onSuccess(response.credential); }
          catch (e) { onError(e.message || "Google login failed."); }
          finally { onBusyChange(false); }
        },
        ux_mode: "popup",
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      containerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard", theme: "outline", size: "large",
        text: "continue_with", shape: "rectangular", logo_alignment: "left",
        locale: "km",
        width: Math.min(400, Math.max(200, containerRef.current.offsetWidth || 320)),
      });
      if (!cancelled) setReady(true);
    }
    loadScript(GOOGLE_GSI_ID, "https://accounts.google.com/gsi/client",
      () => Boolean(window.google?.accounts?.id))
      .then(init)
      .catch(() => { if (!cancelled) onError("Google script failed to load. Check your network, Google origin settings, and VITE_GOOGLE_CLIENT_ID."); });
    return () => { cancelled = true; };
  }, [clientId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`auth-google-wrap${busy ? " is-busy" : ""}`} aria-busy={busy}>
      <div ref={containerRef} className="auth-gsi-host" />
      {!ready && <button
        type="button"
        className="auth-social-btn google"
        disabled
        aria-label="Google login is loading"
      >
        <GoogleIcon />
        Loading Google…
      </button>}
    </div>
  );
}
