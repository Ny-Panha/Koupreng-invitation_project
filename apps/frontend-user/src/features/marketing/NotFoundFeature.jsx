import { Link } from "react-router-dom";
import { useLanguageStore } from '@/stores/useLanguageStore';
import BrandLogo from '@/shared/branding/BrandLogo';

const NotFoundPage = () => {
  const en = useLanguageStore(state => state.lang) === 'en';
  return (
    <main id="system-content" className="system-page" tabIndex={-1} lang={en ? 'en' : 'km'}
      style={{
        padding: "64px 24px",
        textAlign: "center",
        minHeight: "100dvh",
        background: 'var(--ui-theme-canvas)',
        color: 'var(--ui-theme-ink)',
        fontFamily: 'var(--ui-font-management)',
      }}
    >
      <BrandLogo variant="welcome" priority />
      <h1
        style={{
          fontFamily: "var(--ui-font)",
          fontSize: 48,
          color: "var(--ui-theme-gold)",
        }}
      >
        404
      </h1>
      <p style={{ color: "var(--ui-theme-muted)", marginTop: 12 }}>{en ? 'This page could not be found.' : 'មិនមានទំព័រនេះទេ'}</p>
      <Link
        to="/"
        style={{
          display: "inline-block",
          marginTop: 20,
          padding: "10px 24px",
          background: "var(--ui-theme-action)",
          minHeight: 44,
          color: "var(--ui-theme-on-action)",
          borderRadius: 30,
          textDecoration: "none",
        }}
      >
        {en ? 'Back to home' : 'ត្រឡប់ទៅទំព័រដើម'}
      </Link>
    </main>
  );
};

export default NotFoundPage;
