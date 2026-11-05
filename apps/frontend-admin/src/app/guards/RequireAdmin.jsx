import { ShieldAlert } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AdminAuthProvider";

export default function RequireAdmin({ children }) {
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();

    const normalizeRole = (r) => String(r || "").toUpperCase().replace(/^ROLE_/, "");
    const userRole = normalizeRole(user?.role);
    const userRoles = Array.isArray(user?.roles) ? user.roles.map(normalizeRole) : [];

    // Invariant: Only accounts with the ADMIN role are authorized for admin operations
    const isAdmin = userRole === "ADMIN" || userRoles.includes("ADMIN");

    if (isAuthenticated && isAdmin) {
        return children;
    }

    if (isAuthenticated && !isAdmin) {
        return (
            <div role="alert" className="min-h-screen flex items-center justify-center p-6 bg-[#09090b] text-zinc-100">
                <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-[#121215] p-8 text-center shadow-2xl backdrop-blur-xl">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
                        <ShieldAlert className="h-7 w-7" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">Access Denied</h2>
                    <p className="text-sm font-moul text-amber-400/90 mb-3">សិទ្ធិត្រូវបានបដិសេធ</p>
                    <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                        Your account ({user?.email || userRole || "current session"}) does not have administrator privileges.
                        Only verified accounts with the <strong className="text-amber-400 font-semibold">ADMIN</strong> role can access the Koupreng Admin Console.
                    </p>
                    <button
                        type="button"
                        onClick={() => logout()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2.5 text-xs font-semibold text-white transition-colors shadow-lg shadow-red-600/20 cursor-pointer"
                    >
                        Sign Out & Switch Account
                    </button>
                </div>
            </div>
        );
    }

    const nextPath = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(nextPath)}`} replace />;
}
