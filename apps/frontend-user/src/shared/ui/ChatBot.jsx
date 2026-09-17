import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguageStore } from "../../stores/useLanguageStore";
import "./ChatBot.css";

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "koupreng_invitation_bot";
const BOT_URL = `https://t.me/${BOT_USERNAME}`;

const TRANSLATIONS = {
  en: {
    greeting: "Hi there 👋 How can we help you today?",
    support: "Help & Support",
    internal: "Discover how to customize digital invitations, manage guests, and get technical help.",
    opt1Title: "Explore Koupreng Templates",
    opt1Desc: "Find the perfect design for your wedding and start customizing.",
    opt2Title: "Looking to upgrade plan",
    opt2Desc: "Discover Gold or Diamond packages for exclusive features.",
    opt3Title: "Telegram Bot Support",
    opt3Desc: `Chat directly with our support bot on Telegram (@${BOT_USERNAME}).`,
    adminSayHi: "Hi! 👋 How can I help you today?",
    inputPlaceholder: "Enter message to chat with bot...",
    poweredBy: "powered by"
  },
  km: {
    greeting: "សួស្តី 👋 តើមានអ្វីឱ្យយើងខ្ញុំជួយទេ ថ្ងៃនេះ?",
    support: "ជំនួយ និងការគាំទ្រ",
    internal: "ស្វែងយល់ពីរបៀបរៀបចំសន្លឹកការ គ្រប់គ្រងភ្ញៀវ និងដំណោះស្រាយបច្ចេកទេស។",
    opt1Title: "ស្វែងរកគំរូសន្លឹកការ (Templates)",
    opt1Desc: "ស្វែងរកការរចនាដ៏ស្រស់ស្អាតសម្រាប់ពិធីមង្គលការរបស់អ្នក។",
    opt2Title: "ចង់ដំឡើងកញ្ចប់សេវាកម្ម (Packages)",
    opt2Desc: "ស្វែងយល់ពីកញ្ចប់ Gold ឬ Diamond សម្រាប់មុខងារពិសេសៗ។",
    opt3Title: "ជំនួយផ្ទាល់តាម Telegram Bot",
    opt3Desc: `ជជែកផ្ទាល់ជាមួយ Bot គាំទ្រតាម Telegram (@${BOT_USERNAME})។`,
    adminSayHi: "សួស្តី! 👋 តើខ្ញុំអាចជួយអ្វីអ្នកបានទេថ្ងៃនេះ?",
    inputPlaceholder: "វាយបញ្ចូលសារដើម្បីសួរ Telegram Bot...",
    poweredBy: "គាំទ្រដោយ"
  }
};

export default function ChatBot() {
  const location = useLocation();
  const navigate = useNavigate();
  const lang = useLanguageStore((state) => state.lang) || "en";
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [inputMsg, setInputMsg] = useState("");

  // Auto-dismiss greeting bubble after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Listen to external triggers to open support chat (e.g. from Header / Help button)
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setShowGreeting(false);
    };
    window.addEventListener("open-support-chat", handleOpenChat);
    return () => window.removeEventListener("open-support-chat", handleOpenChat);
  }, []);

  // Close greeting when chat opens
  useEffect(() => {
    if (isOpen) {
      setShowGreeting(false);
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    setShowGreeting(false);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    const text = inputMsg.trim();
    if (!text) return;
    const tgUrl = `${BOT_URL}?text=${encodeURIComponent(text)}`;
    window.open(tgUrl, "_blank", "noopener,noreferrer");
    setInputMsg("");
  };

  // Hide chatbot on live invitation preview pages and public guest pages
  const isExcluded =
    location.pathname.startsWith("/w/") ||
    location.pathname.startsWith("/i/") ||
    location.pathname.startsWith("/preview/") ||
    (location.pathname.startsWith("/event/") && !location.pathname.includes("/manage") && !location.pathname.includes("/create")) ||
    (location.pathname.includes("/templates/") && location.pathname.endsWith("/preview"));

  if (isExcluded) {
    return null;
  }

  return (
    <div className="chatbot-wrapper">
      <AnimatePresence>
        {/* Chat Window */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="chat-window"
          >
            <div className="chat-header">
              <div className="chat-header-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>{t.support}</span>
              </div>
              <button className="chat-close-btn" onClick={toggleChat}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>

            <div className="chat-body">
              <div className="chat-greeting-internal">
                {t.internal}
              </div>
              
              <div className="chat-message-row">
                <div className="chat-avatar">
                  <span className="avatar-text">K</span>
                </div>
                <div className="chat-bubble admin-bubble">
                  {t.adminSayHi}
                </div>
              </div>
              
              <div className="chat-options">
                <button
                  type="button"
                  className="chat-option-btn"
                  onClick={() => {
                    navigate("/templates/browse");
                    setIsOpen(false);
                  }}
                >
                  <h4>{t.opt1Title}</h4>
                  <p>{t.opt1Desc}</p>
                </button>
                <button
                  type="button"
                  className="chat-option-btn"
                  onClick={() => {
                    navigate("/dashboard/packages");
                    setIsOpen(false);
                  }}
                >
                  <h4>{t.opt2Title}</h4>
                  <p>{t.opt2Desc}</p>
                </button>
                <button
                  type="button"
                  className="chat-option-btn"
                  onClick={() => {
                    window.open(BOT_URL, "_blank", "noopener,noreferrer");
                  }}
                >
                  <h4>{t.opt3Title}</h4>
                  <p>{t.opt3Desc}</p>
                </button>
              </div>
            </div>

            <form className="chat-footer" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder={t.inputPlaceholder}
                className="chat-input"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
              />
              <button type="submit" className="chat-send-btn" title="Send">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
            <div className="chat-powered-by">
              {t.poweredBy} <strong>Koupreng</strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Greeting Bubble */}
      <AnimatePresence>
        {!isOpen && showGreeting && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25 }}
            className="chat-greeting-bubble"
          >
            {t.greeting}
            <button className="close-bubble" onClick={() => setShowGreeting(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <motion.button
        className="chat-toggle-btn"
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
