import { Outlet, useLocation } from "react-router-dom";
import HostNav from "./components/HostNav";
import "@/shared/styles/workspace-ui.css";
import "./HostShell.css";

export default function HostShell() {
    const location = useLocation();
    const isPreview = location.pathname.endsWith("/preview");
    const isStudio = /^\/app\/events\/\d+\/invitation$/.test(location.pathname);

    if (isPreview) {
        return <Outlet />;
    }

    return (
        <div className={`dash-wrapper${isStudio ? " dash-wrapper--studio" : ""}`}>
            {!isStudio && <HostNav />}
            <div className="dash-main-scroll">
                <Outlet />
            </div>
        </div>
    );
}
