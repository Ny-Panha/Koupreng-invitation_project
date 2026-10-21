import { BatteryFull, Signal, Wifi } from "lucide-react";
import "./PhoneFrame.css";

export default function PhoneFrame({
  children,
  className = "",
  style = {},
  time = "9:41",
  showStatusBar = true,
  showHomeBar = true,
  islandBadge = null,
}) {
  return (
    <div className={`kp-phone-frame ${className}`} style={style} tabIndex={-1}>
      {showStatusBar && (
        <div className="kp-phone-status-bar" aria-hidden="true">
          <span className="kp-phone-status-time">{time}</span>
          <div className="kp-phone-dynamic-island">
            {islandBadge && <span className="kp-island-badge">{islandBadge}</span>}
          </div>
          <div className="kp-phone-status-icons">
            <Signal size={14} strokeWidth={2.2} />
            <Wifi size={14} strokeWidth={2.2} />
            <BatteryFull size={18} strokeWidth={2.2} />
          </div>
        </div>
      )}
      <div className="kp-phone-screen">
        {children}
      </div>
      {showHomeBar && (
        <div className="kp-phone-home-bar" aria-hidden="true">
          <span className="kp-phone-home-indicator" />
        </div>
      )}
    </div>
  );
}

