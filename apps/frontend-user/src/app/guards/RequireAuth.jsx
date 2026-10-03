import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function RequireAuth({ children }) {
  const { isAuthenticated, isLoading, authStatus, sessionError, retrySession } = useAuth();
  const location = useLocation();

  if (isLoading) return <p role="status">Checking your session…</p>;
  if (authStatus === "error") return <div role="alert"><p>{sessionError}</p><button type="button" onClick={retrySession}>Try again</button></div>;

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
