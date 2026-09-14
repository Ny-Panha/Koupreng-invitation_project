import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AdminAuthProvider";

export default function RequireAdmin({ children }) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    const role = String(user?.role || "").toUpperCase();
    const isAdmin =
        role === "ADMIN" ||
        role === "SUPER_ADMIN" ||
        role === "ADMIN_MANAGER" ||
        (Array.isArray(user?.roles) && user.roles.some((r) => String(r).toUpperCase() === "ADMIN"));

    if (isAuthenticated && isAdmin) {
        return children;
    }

    const nextPath = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(nextPath)}`} replace />;
}
