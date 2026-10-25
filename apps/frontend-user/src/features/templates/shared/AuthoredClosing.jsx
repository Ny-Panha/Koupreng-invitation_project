export default function AuthoredClosing({ content }) {
  if (!content.thankYouText && !content.apologyText) return null;
  return <div className="template-authored-closing" data-tx-section="closing">
    {content.thankYouTitle && <h2>{content.thankYouTitle}</h2>}
    {content.thankYouText && <p>{content.thankYouText}</p>}
    {content.apologyTitle && <h2>{content.apologyTitle}</h2>}
    {content.apologyText && <p>{content.apologyText}</p>}
  </div>;
}
