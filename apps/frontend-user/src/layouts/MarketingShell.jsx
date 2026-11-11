 import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useLanguageStore } from "../stores/useLanguageStore";

export default function MarketingShell() {
    const lang = useLanguageStore((state) => state.lang);
    return (
        <div className="kp-marketing-shell" lang={lang}>
            <a className="host-skip-link" href="#marketing-content">
                {lang === "en" ? "Skip to main content" : "រំលងទៅមាតិកាចម្បង"}
            </a>
            <Header />
            <main id="marketing-content" tabIndex={-1} style={{ minHeight: "100vh" }}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
