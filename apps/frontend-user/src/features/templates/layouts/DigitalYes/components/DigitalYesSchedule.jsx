import { Clock, MapPin } from "lucide-react";

export default function DigitalYesSchedule({ schedule = [] }) {
  const validSchedule = (Array.isArray(schedule) ? schedule : []).filter(
    (item) => Boolean(item && (item.title || item.time || item.titleEn))
  );

  if (validSchedule.length === 0) return null;

  return (
    <div className="pt-2 text-left tdy-font-kantumruy max-w-md mx-auto w-full">
      <div className="flex items-center gap-2 justify-center mb-6">
        <Clock className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm sm:text-base font-bold text-amber-200 tdy-font-moul">
          កាលវិភាគកម្មវិធីមង្គលការ
        </h3>
      </div>

      <div className="space-y-1">
        {validSchedule.map((item, idx) => (
          <div key={item.id || idx} className="flex items-start gap-3 sm:gap-4">
            {/* Timeline Dot & Segment */}
            <div className="flex flex-col items-center self-stretch shrink-0 pt-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/25 shadow-[0_0_10px_rgba(212,175,55,0.9)] shrink-0" />
              {idx < validSchedule.length - 1 && (
                <span className="w-px flex-1 bg-gradient-to-b from-amber-400/60 via-amber-400/30 to-amber-500/20 my-1 min-h-[32px]" />
              )}
            </div>

            {/* Time Badge */}
            <span className="text-xs font-bold text-amber-300 font-mono shrink-0 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-400/30 shadow-sm whitespace-nowrap mt-0.5">
              {item.time}
            </span>

            {/* Title & Desc */}
            <div className="flex-1 min-w-0 pt-0.5 pb-4">
              <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">
                {item.title}
              </h4>
              {(item.desc || item.description) && (
                <p className="text-[11px] sm:text-xs text-amber-100/75 mt-1 leading-relaxed">
                  {item.desc || item.description}
                </p>
              )}
              {item.location && (
                <div className="flex items-center gap-1 text-[11px] text-amber-300/80 mt-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span>{item.location}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
