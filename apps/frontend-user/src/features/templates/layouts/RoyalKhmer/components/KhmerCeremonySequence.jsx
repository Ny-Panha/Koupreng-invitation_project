const DEFAULT_KHMER_STEPS = [
  { num: "១", time: "០៧:០០ ព្រឹក", title: "ពិធីហែជំនូន", desc: "ស្វាគមន៍ក្រុមគ្រួសារទាំងសងខាង និងភ្ញៀវកិត្តិយស" },
  { num: "២", time: "០៧:៣០ ព្រឹក", title: "ពិធីរៀបរាប់ផ្លែឈើ", desc: "រៀបចំផ្លែឈើ និងជំនូនតាមប្រពៃណីខ្មែរបុរាណ" },
  { num: "៣", time: "០៨:១៥ ព្រឹក", title: "ពិធីបំពាក់ចិញ្ចៀន", desc: "ពេលវេលាសន្យាសេចក្តីស្នេហារវាងកូនកំលោះ និងកូនក្រមុំ" },
  { num: "៤", time: "០៨:៣០ ព្រឹក", title: "ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត", desc: "និមន្តព្រះសង្ឃសូត្រមន្តប្រសិទ្ធពរជ័យមង្គលវិបុលសុខ" },
  { num: "៥", time: "០៩:៣០ ព្រឹក", title: "ពិធីកាត់សក់ បង្កក់សិរី", desc: "កាត់សក់សិរីសួស្តី ជម្រះឧបទ្រពចង្រៃសាងជីវិតថ្មី" },
  { num: "៦", time: "១០:២៥ ព្រឹក", title: "ពិធីសំពះផ្ទឹម & ចងដៃ", desc: "សំពះផ្ទឹមគោរពមាតាបិតា និងចាស់ទុំចងដៃពរជ័យ" },
  { num: "៧", time: "១២:០០ ថ្ងៃត្រង់", title: "ពិសាអាហារថ្ងៃត្រង់", desc: "ទទួលទានអាហារជួបជុំសាច់ញាតិ និងមិត្តភក្តិ" },
  { num: "៨", time: "០៥:០០ ល្ងាច", title: "ពិធីពិសាភោជនាហារមង្គលការ", desc: "ទទួលភ្ញៀវកិត្តិយស ពិសាអាហារពេលល្ងាច និងរាំកម្សាន្ត" },
];

export default function KhmerCeremonySequence({ schedule = [] }) {
  const steps = (schedule && schedule.length > 0)
    ? schedule.map((item, idx) => ({
        num: ["១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩", "១០"][idx % 10],
        time: item.time,
        title: item.title,
        desc: item.description || item.desc || "",
      }))
    : DEFAULT_KHMER_STEPS;

  return (
    <section style={{ padding: "3rem 1.5rem", maxWidth: "1050px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p style={{ color: "var(--rkh-gold)", fontWeight: "700", letterSpacing: "normal", textTransform: "uppercase", fontSize: "0.85rem" }}>
          កម្មវិធីតាមលំដាប់លំដោយ
        </p>
        <h2 style={{ fontFamily: "Moul, serif", fontSize: "1.75rem", color: "var(--rkh-crimson)" }}>
          កាលវិភាគពិធីមង្គលការប្រពៃណីខ្មែរ
        </h2>
      </div>

      <div className="rkh-sequence-grid">
        {steps.map((step, idx) => (
          <div key={idx} className="rkh-step-card">
            <span className="rkh-step-num">{step.num}</span>
            <div className="rkh-step-time font-mono">{step.time}</div>
            <h3 className="rkh-step-title">{step.title}</h3>
            <p className="rkh-step-desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
