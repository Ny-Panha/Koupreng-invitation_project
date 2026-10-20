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
import {
  initTelegramWebApp,
  TELEGRAM_WEB_APP_READY_EVENT,
} from "../shared/telegram/telegramWebApp";
import { templateCatalogService } from "../features/templates/api/templateCatalogApi";
import { registerDynamicTemplates } from "../features/templates/data/templatesData";

/**
 * App — root component.
 * No more Context providers needed — auth/theme are Zustand stores now.
 */
function App() {
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
            <RouteFontLoader />
            <ScrollToTop />
            <RouteMotion />
            <div className="app-container">
              <AppRouter />
            </div>
            <ToastContainer />
            <SupportWidget />
          </Router>
        </ThemeProvider>
      </QueryProvider>
    </AuthProvider>
  );
}

export default App;
