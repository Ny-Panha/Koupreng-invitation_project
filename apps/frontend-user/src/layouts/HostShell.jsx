import { Outlet, useLocation } from "react-router-dom";
import HostNav from "./components/HostNav";
import "@/shared/styles/workspace-ui.css";
import "./HostShell.css";

export default function HostShell() {
    const location = useLocation();
    const isPreview = location.pathname.endsWith("/preview");
    const isStudio = /^\/app\/events\/\d+\/invitation$/.test(location.pathname);
    const isEventWorkspace = /^\/app\/events\/\d+(?:\/|$)/.test(location.pathname);

    if (isPreview) {
        return <div className="dash-wrapper dash-wrapper--preview"><Outlet /></div>;
    }

    return (
        <div className={`dash-wrapper${isEventWorkspace ? " dash-wrapper--event" : ""}${isStudio ? " dash-wrapper--studio" : ""}`}>
            {!isStudio && <HostNav />}
            <div className="dash-main-scroll">
                <Outlet />
            </div>
        </div>
    );
}
