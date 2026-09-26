import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./router";
import ScrollToTop from "./ScrollToTop";
import { AuthProvider, QueryProvider, ThemeProvider } from "./providers";
import SiteAnimations from "../shared/animations/SiteAnimations";
import ChatBot from "../shared/ui/ChatBot";
import { ToastContainer } from "../shared/ui";
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
            <ScrollToTop />
            <SiteAnimations />
            <div className="app-container">
              <AppRouter />
            </div>
            <ToastContainer />
            <ChatBot />
          </Router>
        </ThemeProvider>
      </QueryProvider>
    </AuthProvider>
  );
}

export default App;
