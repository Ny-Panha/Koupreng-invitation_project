/**
 * Eruda - Console and DevTools for mobile browsers
 * https://github.com/liriliri/eruda
 *
 * Activation rules:
 * - In Development (import.meta.env.DEV): enabled by default
 * - In Production: enabled if URL has ?eruda=true, ?debug=true, or localStorage has 'eruda'='true'
 * - Disable anytime by setting ?eruda=false or localStorage.setItem('eruda', 'false')
 */
export function initEruda() {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const isExplicitlyDisabled =
    urlParams.get('eruda') === 'false' ||
    urlParams.get('debug') === 'false' ||
    window.localStorage?.getItem('eruda') === 'false';

  if (isExplicitlyDisabled) return;

  const hasDebugQuery = urlParams.has('eruda') || urlParams.has('debug');
  const hasStorageFlag = window.localStorage?.getItem('eruda') === 'true';
  const isDevMode = Boolean(import.meta.env && import.meta.env.DEV);

  const shouldInitialize = isDevMode || hasDebugQuery || hasStorageFlag;

  if (shouldInitialize) {
    import('eruda')
      .then((module) => {
        const eruda = module.default || module;
        if (!window.__ERUDA_INITIALIZED__) {
          eruda.init();
          window.__ERUDA_INITIALIZED__ = true;
        }
      })
      .catch((err) => {
        console.warn('Failed to initialize Eruda mobile console:', err);
      });
  }
}
