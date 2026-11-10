import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguageStore } from "../stores/useLanguageStore";

function getPageTitle(pathname, lang) {
  const isEn = lang === "en";
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
  if (pathname.includes("/studio")) return isEn ? "Invitation Studio | Koupreng" : "ស្ទូឌីយោរចនាធៀប | គូព្រេង";
  if (pathname.includes("/preview")) return isEn ? "Invitation Preview | Koupreng" : "មើលគំរូធៀប | គូព្រេង";
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
  if (pathname.startsWith("/templates")) return isEn ? "Templates Catalog | Koupreng" : "កាតាឡុកគំរូធៀប | គូព្រេង";
  return isEn ? "Koupreng - Digital Invitation" : "គូព្រេង - សំបុត្រអញ្ជើញឌីជីថល";
}

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const lang = useLanguageStore((state) => state.lang);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    document.title = getPageTitle(pathname, lang);

    // Assistive technology focus orientation: gently focus h1 or main if present
    const timer = setTimeout(() => {
      const heading = document.querySelector("main h1, .dash-main h1, h1");
      if (heading && !document.activeElement?.matches?.("input, select, textarea, button")) {
        if (!heading.hasAttribute("tabindex")) {
          heading.setAttribute("tabindex", "-1");
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname, lang]);

  return null;
};

export default ScrollToTop;
