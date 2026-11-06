import BrandLogo from "@/shared/branding/BrandLogo";
import { useInvitationLocale } from "./invitationLocaleContext";
import { normalizeInvitationLanguage } from "@/shared/i18n/invitationLanguage";
import "./InvitationBranding.css";

/** Use the same persisted visibility and custom-mark preference as the cover. */
export default function InvitationBranding({ content = {}, textOnly = false, language }) {
  const contextLocale = useInvitationLocale();
  const locale = normalizeInvitationLanguage(language || content.languageMode || contextLocale);
  if (content.showBrandMark === false) return null;
  const customMark = content.brandMark || content.brandMarkUrl || content.design?.brandMark;
  // A custom mark replaces platform attribution. A text-only closing must not
  // introduce an image or restore Koupreng attribution for a custom brand.
  if (customMark && textOnly) return null;
  if (customMark) return <div className="invitation-branding"><img className="invitation-branding__custom" src={customMark} alt={locale === "en" ? "Custom invitation mark" : "រូបសញ្ញាផ្ទាល់ខ្លួន"} loading="lazy" decoding="async" /></div>;
  return <div className="invitation-branding" data-branding="koupreng">
    {textOnly ? <small>{locale === "en" ? "Crafted with love by គូព្រេង" : locale === "kh" ? "បង្កើតដោយក្តីស្រឡាញ់ ដោយគូព្រេង" : "បង្កើតដោយក្តីស្រឡាញ់ ដោយគូព្រេង · Crafted with love by Koupreng"}</small> : <BrandLogo variant="invitation" />}
  </div>;
}
