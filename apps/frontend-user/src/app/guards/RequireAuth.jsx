import { PageSkeleton } from '@/shared/ui/LoadingState';
import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function RequireAuth({ children }) {
  const uiCopy = useUiCopy();
  const { isAuthenticated, isLoading, authStatus, sessionError, retrySession } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSkeleton label={uiCopy("កំពុងពិនិត្យការចូលគណនី…", "Checking your session…")} />;
  if (authStatus === "error") return <div role="alert"><p>{sessionError}</p><button type="button" onClick={retrySession}>{uiCopy("ព្យាយាមម្ដងទៀត", "Try again")}</button></div>;

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
