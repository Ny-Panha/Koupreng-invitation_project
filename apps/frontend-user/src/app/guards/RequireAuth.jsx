import { PageSkeleton } from '@/shared/ui/LoadingState';
import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ShieldAlert, RefreshCw } from "lucide-react";
import "@/features/auth/AuthPage.css";

export default function RequireAuth({ children }) {
  const uiCopy = useUiCopy();
  const { isAuthenticated, isLoading, authStatus, retrySession } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageSkeleton label={uiCopy("កំពុងពិនិត្យការចូលគណនី…", "Checking your session…")} />;
  }

  if (authStatus === "error") {
    const nextDestination = `${location.pathname}${location.search}${location.hash}`;
    return (
      <div className="auth-session-error-wrap">
        <div className="auth-session-error-card" role="alert">
          <div className="auth-session-error-icon" aria-hidden="true">
            <ShieldAlert size={28} />
          </div>
          <h1 className="auth-session-error-title">
            {uiCopy("ការផ្ទៀងផ្ទាត់គណនីមិនបានជោគជ័យ", "Session Verification Failed")}
          </h1>
          <p className="auth-session-error-desc">
            {uiCopy(
                "មិនអាចផ្ទៀងផ្ទាត់គណនីរបស់អ្នកបានទេ។ សូមព្យាយាមម្តងទៀត។",
                "Could not verify your session. Please try again."
              )}
          </p>
          <div className="auth-session-error-actions">
            <button
              type="button"
              onClick={retrySession}
              className="auth-session-error-retry"
            >
              <RefreshCw size={16} aria-hidden="true" />
              <span>{uiCopy("ព្យាយាមម្ដងទៀត", "Try again")}</span>
            </button>
            <Link
              to={`/login?next=${encodeURIComponent(nextDestination)}`}
              className="auth-session-error-link"
            >
              {uiCopy("ត្រឡប់ទៅចូលគណនី", "Sign in with another account")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return children;
  }

  const nextPath = `${location.pathname}${location.search}${location.hash}`;
  return (
    <Navigate
      to={`/login?next=${encodeURIComponent(nextPath)}`}
      replace
      state={{ from: location }}
    />
  );
}
