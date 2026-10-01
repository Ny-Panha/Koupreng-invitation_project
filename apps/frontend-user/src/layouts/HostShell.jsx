import { Outlet, useLocation } from "react-router-dom";
import HostNav from "./components/HostNav";
import "./HostShell.css";

export default function HostShell() {
    const location = useLocation();
    const isPreview = location.pathname.endsWith("/preview");

    if (isPreview) {
        return <Outlet />;
    }

    return (
        <div className="dash-wrapper">
            <HostNav />
            <div className="dash-main-scroll">
                <Outlet />
            </div>
        </div>
    );
}
