import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useLanguageStore } from "../stores/useLanguageStore";

/**
 * MarketingShell — public pages with the global header & footer.
 * Child pages are responsible for their own top padding to clear the fixed header.
 */
export default function MarketingShell() {
    const lang = useLanguageStore((state) => state.lang);
    return (
        <div className="kp-marketing-shell" lang={lang}>
            <Header />
            <main id="marketing-content" tabIndex={-1} style={{ minHeight: "100vh" }}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
