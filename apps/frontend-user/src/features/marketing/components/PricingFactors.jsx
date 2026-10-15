// Public plan discovery, with no amounts or package entitlements implied.
export default function PricingFactors({ copy, compact = false }) {
  const factors = [
    [copy("គំរូសន្លឹកការរបស់អ្នក", "Your invitation design"), copy("គំរូកំណត់រចនាបទសន្លឹកការ។ មើលគំរូជាមុនបាន។ គំរូប្រណិតនីមួយៗមានព័ត៌មានតម្លៃ និងសិទ្ធិប្រើប្រាស់ដែលត្រូវពិនិត្យពេលជ្រើសរើស។", "A design sets the look of your invitation. Preview it first. Individual premium designs have their own price and access checks when you choose.")],
    [copy("កញ្ចប់សេវាកម្មរបស់អ្នក", "Your service package"), copy("កញ្ចប់កំណត់ចំនួនសន្លឹកការ កម្រិតភ្ញៀវ រយៈពេល និងមុខងារដែលរួមបញ្ចូល។ ចូលគណនីដើម្បីមើលព័ត៌មានបច្ចុប្បន្ន រួមទាំងសិទ្ធិគំរូប្រណិត។", "A package sets invitation and guest limits, duration and included tools. Sign in to compare the current details, including any premium design access.")],
  ];
  return <div className={`kp-price-factors${compact ? " kp-price-factors--compact" : ""}`}>
    {factors.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}
  </div>;
}
