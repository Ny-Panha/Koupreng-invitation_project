import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

export default function DigitalYesRsvpModal({ children }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [attendance, setAttendance] = useState("yes");
  const [count, setCount] = useState("1");
  const [wishes, setWishes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (children) {
    return (
      <div id="rsvp-section" className="rounded-3xl bg-black/50 border border-amber-400/35 p-6 sm:p-8 mt-6 text-left backdrop-blur-md max-w-md mx-auto w-full shadow-lg">
        {children}
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div id="rsvp-section" className="rounded-3xl bg-black/50 border border-amber-400/35 p-6 sm:p-8 mt-6 text-left backdrop-blur-md max-w-md mx-auto w-full shadow-lg">
      <div className="text-center mb-6">
        <h4 className="text-base font-bold text-amber-200 tdy-font-moul">ឆ្លើយតបការចូលរួម (RSVP)</h4>
        <p className="text-xs text-amber-200/75 mt-1.5 leading-relaxed">
          សូមផ្ដល់ដំណឹងជូនម្ចាស់កម្មវិធីដើម្បីងាយស្រួលរៀបចំតុទទួលភ្ញៀវ
        </p>
      </div>

      {submitted ? (
        <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center animate-fade-in">
          <CheckCircle2 className="h-9 w-9 text-emerald-400 mx-auto mb-2" />
          <h5 className="text-sm font-bold text-emerald-300">អរគុណសម្រាប់ការឆ្លើយតប!</h5>
          <p className="text-xs text-emerald-200/80 mt-1">
            ព័ត៌មានត្រូវបានកត់ត្រាដោយជោគជ័យ។ ជួបគ្នាក្នុងថ្ងៃពិសេស!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-amber-200/90 mb-1.5">
              ឈ្មោះរបស់អ្នក (Your Name) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ឧ. លោក សុខ សុវណ្ណ"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-amber-400/30 text-amber-100 placeholder:text-amber-200/30 text-xs focus:outline-none focus:border-amber-400 focus:bg-white/[0.09] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-200/90 mb-1.5">
              លេខទូរស័ព្ទ (Phone Number)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="012 345 678"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-amber-400/30 text-amber-100 placeholder:text-amber-200/30 text-xs focus:outline-none focus:border-amber-400 focus:bg-white/[0.09] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-200/90 mb-1.5">
              ការចូលរួម (Will you attend?)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setAttendance("yes")}
                className={`py-2.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                  attendance === "yes"
                    ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 border-amber-400 font-bold shadow-md"
                    : "bg-white/[0.04] text-amber-200/80 border-amber-400/25 hover:bg-white/[0.08]"
                }`}
              >
                ✓ នឹងចូលរួម
              </button>
              <button
                type="button"
                onClick={() => setAttendance("no")}
                className={`py-2.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                  attendance === "no"
                    ? "bg-rose-700 text-white border-rose-500 font-bold shadow-md"
                    : "bg-white/[0.04] text-amber-200/80 border-amber-400/25 hover:bg-white/[0.08]"
                }`}
              >
                ✗ មិនអាចចូលរួម
              </button>
            </div>
          </div>

          {attendance === "yes" && (
            <div>
              <label className="block text-xs font-semibold text-amber-200/90 mb-1.5">
                ចំនួនអ្នកចូលរួម (Number of guests)
              </label>
              <select
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#20050d] border border-amber-400/30 text-amber-100 text-xs focus:outline-none focus:border-amber-400 transition cursor-pointer"
              >
                <option value="1">១ នាក់ (1 person)</option>
                <option value="2">២ នាក់ (2 persons)</option>
                <option value="3">៣ នាក់ (3 persons)</option>
                <option value="4">៤ នាក់ (4 persons)</option>
                <option value="5">៥ នាក់ (5 persons)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-amber-200/90 mb-1.5">
              ពាក្យជូនពរ (Wishes &amp; Blessing)
            </label>
            <textarea
              rows={3}
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              placeholder="សូមជូនពរឱ្យគូស្វាមីភរិយាថ្មី មានសុភមង្គល..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-amber-400/30 text-amber-100 placeholder:text-amber-200/30 text-xs focus:outline-none focus:border-amber-400 focus:bg-white/[0.09] resize-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>ផ្ញើការឆ្លើយតប (Submit RSVP)</span>
          </button>
        </form>
      )}
    </div>
  );
}
