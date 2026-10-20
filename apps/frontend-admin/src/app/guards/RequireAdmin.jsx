import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AdminAuthProvider";

export default function RequireAdmin({ children }) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    const normalizeRole = (r) => String(r || "").toUpperCase().replace(/^ROLE_/, "");
    const userRole = normalizeRole(user?.role);
    const userRoles = Array.isArray(user?.roles) ? user.roles.map(normalizeRole) : [];
    const isAdmin =
        userRole === "ADMIN" ||
        userRole === "SUPER_ADMIN" ||
        userRole === "ADMIN_MANAGER" ||
        userRoles.some((r) => r === "ADMIN" || r === "SUPER_ADMIN" || r === "ADMIN_MANAGER");

    if (isAuthenticated && isAdmin) {
        return children;
    }

    const nextPath = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(nextPath)}`} replace />;
}
