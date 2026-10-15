 import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useLanguageStore } from "../stores/useLanguageStore";

export default function MarketingShell() {
    const lang = useLanguageStore((state) => state.lang);
    useEffect(() => {
        const previous = document.documentElement.lang;
        document.documentElement.lang = lang;
        return () => { document.documentElement.lang = previous; };
    }, [lang]);
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
