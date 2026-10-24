import ProgramDetails from "../ProgramDetails";
import { Clock, MapPin } from "lucide-react";

export default function ScheduleList({
  items = [],
  className = "",
  itemClassName = "",
  renderItem,
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`schedule-list-root ${className}`}>
      {items.map((item, idx) => {
        if (renderItem) {
          return renderItem(item, idx);
        }

        return (
          <div key={item.id || idx} className={`schedule-list-item ${itemClassName}`}>
            <div className="schedule-item-time" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={16} />
              <span>{item.time}</span>
            </div>
            <div className="schedule-item-details">
              <ProgramDetails item={item} /><h4 className="schedule-item-title">{item.title}</h4>
              {item.titleEn && <p className="schedule-item-title-en">{item.titleEn}</p>}
              {item.description && <p className="schedule-item-desc">{item.description}</p>}
              {item.location && (
                <p className="schedule-item-loc" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={14} />
                  <span>{item.location}</span>
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
