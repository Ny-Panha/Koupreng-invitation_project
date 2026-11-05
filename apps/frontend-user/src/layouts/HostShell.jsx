import { Suspense } from "react";
import RouteLoadingSkeleton from "@/shared/ui/RouteLoadingSkeleton";
import { Outlet, useLocation } from "react-router-dom";
import HostNav from "./components/HostNav";
import { useLanguageStore } from "@/stores/useLanguageStore";
import "@/shared/styles/workspace-ui.css";
import "./HostShell.css";

export default function HostShell() {
    const location = useLocation();
    const language = useLanguageStore((state) => state.lang);
    const isPreview = location.pathname.endsWith("/preview");
    const isStudio = /^\/app\/events\/\d+\/invitation$/.test(location.pathname);
    const isEventWorkspace = /^\/app\/events\/\d+(?:\/|$)/.test(location.pathname);

    if (isPreview) {
        return (
            <div className="dash-wrapper dash-wrapper--preview">
                <Suspense fallback={<RouteLoadingSkeleton />}>
                    <Outlet />
                </Suspense>
            </div>
        );
    }

    return (
        <div className={`dash-wrapper${isEventWorkspace ? " dash-wrapper--event" : ""}${isStudio ? " dash-wrapper--studio" : ""}`}>
            {!isStudio && (
                <>
                    <a className="host-skip-link" href="#host-main-content">
                        {language === "en" ? "Skip to main content" : "រំលងទៅមាតិកាចម្បង"}
                    </a>
                    <HostNav />
                </>
            )}
            <div id="host-main-content" className="dash-main-scroll">
                <Suspense fallback={<RouteLoadingSkeleton />}>
                    <Outlet />
                </Suspense>
            </div>
        </div>
    );
}
