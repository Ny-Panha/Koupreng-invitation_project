import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./router";
import ScrollToTop from "./ScrollToTop";
import AuthProvider from "./providers/AuthProvider";
import QueryProvider from "./providers/QueryProvider";
import ThemeProvider from "./providers/ThemeProvider";
import SiteAnimations from "../shared/animations/SiteAnimations";
import ChatBot from "../shared/ui/ChatBot";
import {
  initTelegramWebApp,
  TELEGRAM_WEB_APP_READY_EVENT,
} from "../shared/telegram/telegramWebApp";

/**
 * App — root component.
 * No more Context providers needed — auth/theme are Zustand stores now.
 */
function App() {
  useEffect(() => {
    initTelegramWebApp();
    window.addEventListener(TELEGRAM_WEB_APP_READY_EVENT, initTelegramWebApp);
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
            <ChatBot />
          </Router>
        </ThemeProvider>
      </QueryProvider>
    </AuthProvider>
  );
}

export default App;
