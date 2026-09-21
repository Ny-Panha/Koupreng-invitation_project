/**
 * Telegram Mini App (WebApp) Integration Helper & Hook
 * Provides safe bindings to window.Telegram.WebApp for full mobile immersion.
 */

import { useEffect, useState } from "react";

export function getTelegramWebApp() {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp || null;
}

export function isInsideTelegram() {
  const tg = getTelegramWebApp();
  return Boolean(tg && tg.initData && tg.initData.length > 0);
}

/**
 * Initializes Telegram WebApp environment, expanding viewport and syncing theme tokens.
 */
export function initTelegramWebApp() {
  const tg = getTelegramWebApp();
  if (!tg) return;

  try {
    tg.ready();
    tg.expand();

    // Enable closing confirmation to prevent accidental swipe-down exits on forms
    if (typeof tg.enableClosingConfirmation === "function") {
      tg.enableClosingConfirmation();
    }

    // Set matching ceremonial cream / gold header
    if (typeof tg.setHeaderColor === "function") {
      tg.setHeaderColor("#FAF6F0");
    }
    if (typeof tg.setBackgroundColor === "function") {
      tg.setBackgroundColor("#FAF6F0");
    }

    // Bind viewport height CSS variable
    const updateViewport = () => {
      if (tg.viewportHeight) {
        document.documentElement.style.setProperty(
          "--tg-viewport-height",
          `${tg.viewportHeight}px`
        );
      }
    };

    updateViewport();
    if (typeof tg.onEvent === "function") {
      tg.onEvent("viewportChanged", updateViewport);
    }
  } catch (err) {
    console.warn("⚠️ [Telegram WebApp Init]:", err?.message || err);
  }
}

/**
 * Triggers native haptic vibration pulse on mobile devices via Telegram
 * @param {'impact' | 'notification' | 'selection'} type
 * @param {'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning'} style
 */
export function triggerHaptic(type = "impact", style = "medium") {
  const tg = getTelegramWebApp();
  if (!tg?.HapticFeedback) {
    // Fallback to standard Navigator Vibration API if supported
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(style === "heavy" ? 35 : 18);
    }
    return;
  }

  try {
    if (type === "impact") {
      tg.HapticFeedback.impactOccurred(style);
    } else if (type === "notification") {
      tg.HapticFeedback.notificationOccurred(style);
    } else if (type === "selection") {
      tg.HapticFeedback.selectionChanged();
    }
  } catch {
    // Haptics are optional and may be rejected by unsupported clients.
  }
}

/**
 * React Hook for Telegram WebApp state
 */
export function useTelegramWebApp() {
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg) {
      initTelegramWebApp();
      setIsTelegram(Boolean(tg.initData && tg.initData.length > 0));
      setUser(tg.initDataUnsafe?.user || null);
    }
  }, []);

  return {
    isTelegram,
    user,
    tg: getTelegramWebApp(),
    triggerHaptic,
  };
}
