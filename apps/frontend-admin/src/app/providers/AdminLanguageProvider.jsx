import { createContext, useContext, useState, useEffect, useMemo } from "react";

const STORAGE_KEY = "koupreng.admin.lang";

export const ADMIN_DICTIONARY = {
  km: {
    brandName: "គូព្រេង KOUPRENG",
    brandSub: "ប្រព័ន្ធគ្រប់គ្រងគូព្រេង",
    nav: {
      overview: "ទិដ្ឋភាពទូទៅ",
      dashboard: "ផ្ទាំងគ្រប់គ្រង",
      management: "ការគ្រប់គ្រងទូទៅ",
      users: "អ្នកប្រើប្រាស់",
      events: "ព្រឹត្តិការណ៍",
      invitations: "ធៀបការ & RSVP",
      catalog: "គំរូ & កញ្ចប់សេវា",
      templates: "គំរូធៀបការ",
      packages: "កញ្ចប់សេវាកម្ម",
      finance: "ហិរញ្ញវត្ថុ & របាយការណ៍",
      payments: "ការទូទាត់ (KHQR)",
      reports: "របាយការណ៍",
      system: "ប្រព័ន្ធ & សុវត្ថិភាព",
      notifications: "ការជូនដំណឹង",
      systemLogs: "កំណត់ហេតុប្រព័ន្ធ",
    },
    topMenu: {
      notifications: "ការជូនដំណឹង",
      themeLight: "ប្ដូរទៅ Light Mode",
      themeDark: "ប្ដូរទៅ Dark Mode",
      language: "ភាសា",
      superAdmin: "SUPER ADMIN",
      account: "គណនី",
      profile: "ប្រវត្តិរូប",
      signOut: "ចាកចេញពីប្រព័ន្ធ",
      allUsers: "បញ្ជីអ្នកប្រើប្រាស់ទាំងអស់",
    },
    pageTitles: {
      "/dashboard": "ផ្ទាំងគ្រប់គ្រងទូទៅ",
      "/users": "គ្រប់គ្រងអ្នកប្រើប្រាស់",
      "/events": "គ្រប់គ្រងព្រឹត្តិការណ៍",
      "/invitations": "គ្រប់គ្រងធៀបការ & RSVP",
      "/templates": "គ្រប់គ្រងគំរូធៀបការ",
      "/packages": "គ្រប់គ្រងកញ្ចប់សេវាកម្ម",
      "/payments": "របាយការណ៍ការទូទាត់ (KHQR)",
      "/notifications": "គ្រប់គ្រងការជូនដំណឹង",
      "/system-logs": "កំណត់ហេតុប្រព័ន្ធ",
      "/reports": "របាយការណ៍សង្ខេប & Analytics",
      fallback: "ផ្ទាំងរដ្ឋបាលគូព្រេង",
    },
    common: {
      search: "ស្វែងរក...",
      filter: "ចម្រោះ",
      all: "ទាំងអស់",
      active: "សកម្ម",
      inactive: "អសកម្ម",
      published: "ផ្សាយផ្ទាល់",
      draft: "ព្រាង",
      create: "បង្កើតថ្មី",
      edit: "កែប្រែ",
      delete: "លុប",
      save: "រក្សាទុក",
      cancel: "បោះបង់",
      loading: "កំពុងដំណើរការ...",
      noData: "គ្មានទិន្នន័យទេ",
      actions: "សកម្មភាព",
      status: "ស្ថានភាព",
      date: "កាលបរិច្ឆេទ",
      close: "បិទ",
    },
    templateEditor: {
      back: "ត្រឡប់ទៅបញ្ជីគំរូ",
      save: "រក្សាទុក & ផ្សាយ",
      saving: "កំពុងរក្សាទុក...",
      userTab: "មើល User Tab",
      themeTab: "រចនាបទ",
      musicTab: "តន្ត្រី & សំឡេង",
      scheduleTab: "កម្មវិធី & រូប",
      venueTab: "ទីតាំង & QR",
      settingsTab: "ការកំណត់",
      liveSimulator: "Live Simulator",
      coverView: "ស្រោមសំបុត្រ (Cover)",
      fullView: "មាតិកាពេញ (Full)",
      colorsFonts: "ពណ៌ & ពុម្ពអក្សរ (Colors & Fonts)",
      coverHero: "ស្រោម & កាតរូបថត (Cover & Hero)",
      gateStyle: "ម៉ូដរចនាបើកសំបុត្រ (Gate Opening Style)",
      cardMotion: "ចលនាកាត & ការរំកិល (Card Motion & Layout)",
      mobileView: "Mobile (380px)",
      tabletView: "Tablet (680px)",
      desktopView: "Desktop",
    },
  },
  en: {
    brandName: "KOUPRENG Wedding",
    brandSub: "Admin Management Portal",
    nav: {
      overview: "Overview",
      dashboard: "Dashboard",
      management: "Management",
      users: "Users",
      events: "Events",
      invitations: "Invitations & RSVP",
      catalog: "Catalog & Pricing",
      templates: "Templates",
      packages: "Packages",
      finance: "Finance & Reports",
      payments: "Payments (KHQR)",
      reports: "Reports & Analytics",
      system: "System & Security",
      notifications: "Notifications",
      systemLogs: "System Logs",
    },
    topMenu: {
      notifications: "Notifications",
      themeLight: "Switch to Light Mode",
      themeDark: "Switch to Dark Mode",
      language: "Language",
      superAdmin: "SUPER ADMIN",
      account: "Account",
      profile: "Profile",
      signOut: "Sign Out",
      allUsers: "All Users Directory",
    },
    pageTitles: {
      "/dashboard": "Dashboard Overview",
      "/users": "User Management",
      "/events": "Event Management",
      "/invitations": "Invitations & RSVP Management",
      "/templates": "Template Catalog",
      "/packages": "Pricing & Packages",
      "/payments": "KHQR Payment Reports",
      "/notifications": "Notification Center",
      "/system-logs": "System Logs",
      "/reports": "Summary & Analytics",
      fallback: "Koupreng Admin Portal",
    },
    common: {
      search: "Search...",
      filter: "Filter",
      all: "All",
      active: "Active",
      inactive: "Inactive",
      published: "Published",
      draft: "Draft",
      create: "Create New",
      edit: "Edit",
      delete: "Delete",
      save: "Save Changes",
      cancel: "Cancel",
      loading: "Loading...",
      noData: "No data available",
      actions: "Actions",
      status: "Status",
      date: "Date",
      close: "Close",
    },
    templateEditor: {
      back: "Back to Templates",
      save: "Save & Publish",
      saving: "Saving...",
      userTab: "Open User Tab",
      themeTab: "Theme & Styles",
      musicTab: "Music & Audio",
      scheduleTab: "Schedule & Photos",
      venueTab: "Venue & QR",
      settingsTab: "Settings",
      liveSimulator: "Live Simulator",
      coverView: "Envelope (Cover)",
      fullView: "Full Invitation (Full)",
      colorsFonts: "Colors & Fonts",
      coverHero: "Cover & Hero Photo",
      gateStyle: "Gate Opening Style",
      cardMotion: "Card Motion & Layout",
      mobileView: "Mobile (380px)",
      tabletView: "Tablet (680px)",
      desktopView: "Desktop",
    },
  },
};

const AdminLanguageContext = createContext({
  lang: "km",
  setLang: () => {},
  t: (path, fallback) => fallback || path,
  messages: ADMIN_DICTIONARY.km,
});

export function AdminLanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("koupreng.lang");
      return stored === "en" ? "en" : "km";
    } catch {
      return "km";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      localStorage.setItem("koupreng.lang", lang);
    } catch {
      // ignore storage errors
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (nextLang) => {
    if (nextLang === "km" || nextLang === "en") {
      setLangState(nextLang);
    }
  };

  const messages = useMemo(() => ADMIN_DICTIONARY[lang] || ADMIN_DICTIONARY.km, [lang]);

  const t = (path, fallback = "") => {
    if (!path) return fallback;
    const parts = path.split(".");
    let current = messages;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return fallback || path;
      }
    }
    return typeof current === "string" ? current : fallback || path;
  };

  const value = useMemo(() => ({ lang, setLang, t, messages }), [lang, messages]);

  return (
    <AdminLanguageContext.Provider value={value}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  return useContext(AdminLanguageContext);
}

export default AdminLanguageProvider;

