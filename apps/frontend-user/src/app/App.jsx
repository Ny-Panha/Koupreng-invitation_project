import { useEffect } from "react";
import "@/shared/navigation/unsavedHistoryGuard";
import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./router";
import ScrollToTop from "./ScrollToTop";
import { AuthProvider, QueryProvider, ThemeProvider } from "./providers";
import RouteMotion from "../shared/animations/RouteMotion";
import SupportWidget from "../shared/ui/SupportWidget";
import RouteFontLoader from "../shared/fonts/RouteFontLoader";
import ToastContainer from "../shared/ui/ToastContainer";
import FeedbackHost from "../shared/feedback/FeedbackHost";
import EntitlementProvider from "../shared/access/EntitlementProvider";
import {
  initTelegramWebApp,
  TELEGRAM_WEB_APP_READY_EVENT,
} from "../shared/telegram/telegramWebApp";
import { templateCatalogService } from "../features/templates/api/templateCatalogApi";
import { registerDynamicTemplates } from "../features/templates/data/templatesData";
import { useLanguageStore } from "../stores/useLanguageStore";

/**
 * App — root component.
 * No more Context providers needed — auth/theme are Zustand stores now.
 */
function App() {
  const lang = useLanguageStore(state => state.lang);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === "en" ? "Koupreng - Digital Invitation" : "គូព្រេង - ធៀបការឌីជីថល";
  }, [lang]);
  useEffect(() => {
    initTelegramWebApp();
    window.addEventListener(TELEGRAM_WEB_APP_READY_EVENT, initTelegramWebApp);
    templateCatalogService.list()
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          const activeTemplates = items.filter((item) => String(item.status || "ACTIVE").toUpperCase() === "ACTIVE");
          registerDynamicTemplates(activeTemplates);
        }
      })
      .catch(() => {});
    return () => window.removeEventListener(TELEGRAM_WEB_APP_READY_EVENT, initTelegramWebApp);
  }, []);
  return (
    <AuthProvider>
      <QueryProvider>
        <ThemeProvider>
          <Router>
            <EntitlementProvider>
            <RouteFontLoader />
            <ScrollToTop />
            <RouteMotion />
            <div className="app-container">
              <AppRouter />
            </div>
            <ToastContainer />
            <FeedbackHost />
            <SupportWidget />
            </EntitlementProvider>
          </Router>
        </ThemeProvider>
      </QueryProvider>
    </AuthProvider>
  );
}

export default App;
