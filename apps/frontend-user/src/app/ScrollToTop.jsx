import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { useLanguageStore } from "../stores/useLanguageStore";

function getPageTitle(pathname, lang) {
  const isEn = lang === "en";
  const accountTitles = {
    '/app/profile': ['Account Profile', 'គណនីផ្ទាល់ខ្លួន'],
    '/app/notifications': ['Notifications', 'ការជូនដំណឹង'],
    '/app/packages': ['Packages & access', 'កញ្ចប់សេវាកម្ម'],
    '/app/payments': ['Payment History', 'ប្រវត្តិការទូទាត់'],
    '/app/templates/paid': ['Paid Templates', 'គំរូដែលបានទិញ'],
    '/app/organizations': ['Organizations', 'ស្ថាប័ន'],
  };
  if (accountTitles[pathname]) return `${accountTitles[pathname][isEn ? 0 : 1]} | ${isEn ? 'Koupreng' : 'គូព្រេង'}`;
  if (!pathname || pathname === "/" || pathname === "") {
    return isEn ? "Koupreng - Digital Invitation" : "គូព្រេង - សំបុត្រអញ្ជើញឌីជីថល";
  }
  if (pathname.startsWith("/login")) return isEn ? "Login | Koupreng" : "ចូលគណនី | គូព្រេង";
  if (pathname.startsWith("/register")) return isEn ? "Register | Koupreng" : "ចុះឈ្មោះ | គូព្រេង";
  if (pathname.startsWith("/forgot-password")) return isEn ? "Forgot Password | Koupreng" : "ភ្លេចពាក្យសម្ងាត់ | គូព្រេង";
  if (pathname.startsWith("/reset-password")) return isEn ? "Reset Password | Koupreng" : "កំណត់ពាក្យសម្ងាត់ឡើងវិញ | គូព្រេង";
  if (pathname.startsWith("/app/change-password")) return isEn ? "Change Password | Koupreng" : "ប្តូរពាក្យសម្ងាត់ | គូព្រេង";
  if (pathname.startsWith("/venues")) return isEn ? "Wedding Venues | Koupreng" : "ទីតាំងរៀបមង្គលការ | គូព្រេង";
  if (pathname.startsWith("/pricing")) return isEn ? "Pricing & Packages | Koupreng" : "តម្លៃ និងកញ្ចប់សេវាកម្ម | គូព្រេង";
  if (pathname.startsWith("/profile")) return isEn ? "Account Profile | Koupreng" : "គណនីផ្ទាល់ខ្លួន | គូព្រេង";
  if (pathname.startsWith("/notifications")) return isEn ? "Notifications | Koupreng" : "ការជូនដំណឹង | គូព្រេង";
  if (pathname.startsWith("/payment/success")) return isEn ? "Payment Confirmation | Koupreng" : "ការបញ្ជាក់ការទូទាត់ | គូព្រេង";
  if (pathname.startsWith("/payment/cancel")) return isEn ? "Payment Cancelled | Koupreng" : "ការទូទាត់ត្រូវបានបោះបង់ | គូព្រេង";
  if (pathname.startsWith("/app/events/new")) return isEn ? "Create Event | Koupreng" : "បង្កើតកម្មវិធីថ្មី | គូព្រេង";
  if (pathname.includes("/studio")) return isEn ? "Invitation Studio | Koupreng" : "ស្ទូឌីយោរចនាសំបុត្រអញ្ជើញ | គូព្រេង";
  if (pathname.includes("/preview")) return isEn ? "Invitation Preview | Koupreng" : "មើលគំរូសំបុត្រអញ្ជើញ | គូព្រេង";
  if (pathname.includes("/guests")) return isEn ? "Guest List | Koupreng" : "បញ្ជីភ្ញៀវ | គូព្រេង";
  if (pathname.includes("/check-in")) return isEn ? "Check-in Desk | Koupreng" : "តុកត់ត្រាវត្តមាន | គូព្រេង";
  if (pathname.includes("/seating")) return isEn ? "Seating Plan | Koupreng" : "ប្លង់កៅអី | គូព្រេង";
  if (pathname.includes("/budget") || pathname.includes("/expenses")) return isEn ? "Budget & Expenses | Koupreng" : "ថវិកា និងចំណាយ | គូព្រេង";
  if (pathname.includes("/reports")) return isEn ? "Event Reports | Koupreng" : "របាយការណ៍កម្មវិធី | គូព្រេង";
  if (pathname.includes("/wishes")) return isEn ? "Guest Wishes | Koupreng" : "ពាក្យជូនពរ | គូព្រេង";
  if (pathname.includes("/team")) return isEn ? "Event Team | Koupreng" : "ក្រុមការងារកម្មវិធី | គូព្រេង";
  if (pathname.includes("/tickets")) return isEn ? "Ticket Designer | Koupreng" : "រចនាសំបុត្រ | គូព្រេង";
  if (pathname.includes("/settings")) return isEn ? "Event Settings | Koupreng" : "ការកំណត់កម្មវិធី | គូព្រេង";
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/app/events")) return isEn ? "Events Dashboard | Koupreng" : "ផ្ទាំងគ្រប់គ្រងកម្មវិធី | គូព្រេង";
  if (pathname.startsWith("/templates")) return isEn ? "Templates Catalog | Koupreng" : "កាតាឡុកគំរូសំបុត្រអញ្ជើញ | គូព្រេង";
  return isEn ? "Koupreng - Digital Invitation" : "គូព្រេង - សំបុត្រអញ្ជើញឌីជីថល";
}

const ScrollToTop = () => {
  const { pathname, key, hash } = useLocation();
  const navigationType = useNavigationType();
  const lang = useLanguageStore((state) => state.lang);
  const positions = useRef(new Map());
  const previous = useRef(null);

  useEffect(() => {
    document.title = getPageTitle(pathname, lang);
  }, [pathname, lang]);

  useEffect(() => {
    // Published/demo invitations own their focus, scroll and cinematic gates.
    const managed = pathname === '/' || /^\/(?:login|register|forgot-password|reset-password|pricing|contact|venues|app|dashboard)(?:\/|$)/.test(pathname) || pathname === '/templates';
    const changed = previous.current !== null && previous.current.pathname !== pathname;
    const sameDocument = previous.current?.pathname === pathname && previous.current?.hash === hash;
    previous.current = { pathname, hash };
    if (!managed) return;
    const oldRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const targetTop = navigationType === 'POP' ? positions.current.get(key) ?? window.scrollY : sameDocument ? window.scrollY : 0;
    let frame;
    const ready = () => {
      const main = document.querySelector('#marketing-content, #host-main-content, #auth-content');
      if (!main || !main.getClientRects().length || main.querySelector('.k-loading-region[aria-busy="true"]')) return;
      // A suspended destination can retain its shell while its page is loading.
      if (!main.querySelector('h1, form, [role="alert"]')) return;
      // An alias or slow API may settle after the user has already started a
      // task. Late route orientation must not steal a field/table's focus.
      const active = document.activeElement;
      const engaged = active !== main && main.contains(active) && active.tabIndex >= 0;
      let anchor;
      try { anchor = hash && document.getElementById(decodeURIComponent(hash.slice(1))); }
      catch { /* An invalid fragment must not break route navigation. */ }
      if (!engaged) {
        if (anchor) anchor.scrollIntoView();
        else window.scrollTo({ top: targetTop, left: 0, behavior: 'instant' });
        if (changed) main.focus({ preventScroll: true });
      }
      observer.disconnect();
    };
    const observer = new MutationObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(ready); });
    observer.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
    frame = requestAnimationFrame(ready);
    const remember = () => {
      positions.current.set(key, window.scrollY);
      if (positions.current.size > 100) positions.current.delete(positions.current.keys().next().value);
    };
    window.addEventListener('scroll', remember, { passive: true });
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener('scroll', remember);
      window.history.scrollRestoration = oldRestoration;
    };
  }, [key, pathname, hash, navigationType]);

  return null;
};

export default ScrollToTop;
