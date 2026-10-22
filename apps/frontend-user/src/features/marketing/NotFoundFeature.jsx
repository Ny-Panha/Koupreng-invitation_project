import { Link } from "react-router-dom";
import { useLanguageStore } from '@/stores/useLanguageStore';

const NotFoundPage = () => {
  const en = useLanguageStore(state => state.lang) === 'en';
  return (
    <div role="main"
      style={{
        padding: 80,
        textAlign: "center",
        minHeight: "calc(100vh - 200px)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--ui-font)",
          fontSize: 48,
          color: "#7D6443",
        }}
      >
        404
      </h1>
      <p style={{ color: "var(--ui-muted)", marginTop: 12 }}>{en ? 'This page could not be found.' : 'មិនមានទំព័រនេះទេ'}</p>
      <Link
        to="/"
        style={{
          display: "inline-block",
          marginTop: 20,
          padding: "10px 24px",
          background: "var(--ui-action)",
          minHeight: 44,
          color: "white",
          borderRadius: 30,
          textDecoration: "none",
        }}
      >
        {en ? 'Back to home' : 'ត្រឡប់ទៅទំព័រដើម'}
      </Link>
    </div>
  );
};

export default NotFoundPage;
