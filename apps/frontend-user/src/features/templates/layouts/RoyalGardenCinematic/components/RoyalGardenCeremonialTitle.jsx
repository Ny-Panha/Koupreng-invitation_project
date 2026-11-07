const CEREMONIAL_TITLE='សិរីមង្គលអាពាហ៍ពិពាហ៍';

export default function RoyalGardenCeremonialTitle({text,heritage}) {
  if (!heritage) return <h1>{text}</h1>;
  const ceremonial=String(text).replace(/[\s\u200b-\u200d\ufeff]/g,'')===CEREMONIAL_TITLE;
  return <h1 className="rg-kbach-title" lang={ceremonial ? 'km' : undefined} aria-label={text}>
    {ceremonial ? <><span className="rg-kbach-title-small">សិរីមង្គល</span><span className="rg-kbach-title-main">អាពាហ៍ពិពាហ៍</span></> : text === 'Wedding Invitation' ? <><span className="rg-kbach-title-small rg-kbach-title-en">Wedding</span><span className="rg-kbach-title-main rg-kbach-title-en">Invitation</span></> : <span>{text}</span>}
    <svg className="rg-title-flourish" viewBox="0 0 200 24" fill="none" aria-hidden="true"><path d="M8 17h43c17 0 22-11 37-11M192 17h-43c-17 0-22-11-37-11M24 21h29c14 0 21-7 34-7M176 21h-29c-14 0-21-7-34-7" stroke="currentColor" strokeWidth="1.2"/><path d="m100 2 6 9-6 9-6-9Z" stroke="currentColor"/><circle cx="100" cy="11" r="2" fill="currentColor"/></svg>
  </h1>;
}
