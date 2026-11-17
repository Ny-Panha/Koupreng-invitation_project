import { Outlet } from "react-router-dom";

/**
 * AuthShell — wraps login / register / forgot-password pages.
 * No global header or footer; auth pages own their own visuals.
 */
export default function AuthShell() {
    return (
        <main className="auth-shell" id="auth-content" tabIndex={-1}>
            <Outlet />
        </main>
    );
}
