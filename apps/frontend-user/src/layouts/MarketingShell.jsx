 import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useLanguageStore } from "../stores/useLanguageStore";
import MarketingMetadata from '../features/marketing/MarketingMetadata';
import ContactDraftProvider from '../features/marketing/ContactDraftProvider';
import { useAuth } from '../features/auth/hooks/useAuth';

export default function MarketingShell() {
    const lang = useLanguageStore((state) => state.lang);
    const { user } = useAuth();
    return (
        <div className="kp-marketing-shell" lang={lang}>
            <MarketingMetadata />
            <a className="host-skip-link" href="#marketing-content">
                {lang === "en" ? "Skip to main content" : "រំលងទៅមាតិកាចម្បង"}
            </a>
            <Header />
            <main id="marketing-content" tabIndex={-1} style={{ minHeight: "100vh" }}>
                <ContactDraftProvider key={user?.id ?? 'anonymous'}><Outlet /></ContactDraftProvider>
            </main>
            <Footer />
        </div>
    );
}
