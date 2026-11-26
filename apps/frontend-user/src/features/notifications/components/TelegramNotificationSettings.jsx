import { useEffect, useState } from "react";
import { api } from "@/shared/api/httpClient";
import { useUiCopy } from "@/shared/i18n/useUiCopy";

const endpoint = "/v1/telegram/user";

export default function TelegramNotificationSettings() {
  const copy = useUiCopy();
  const [settings, setSettings] = useState(null);
  const [link, setLink] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await api.get(endpoint + "/settings");
        if (active) {
          setSettings(response.data);
          if (response.data?.connected) setLink(null);
        }
      } catch {
        if (active) setError(true);
      }
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const update = async () => {
    setBusy(true);
    setError(false);
    try {
      if (settings.connected) {
        await api.delete(endpoint + "/link");
        setSettings({ ...settings, connected: false });
        setLink(null);
      } else {
        const response = await api.post(endpoint + "/link", {});
        setLink(response.data?.url);
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  if (!settings?.available) return null;
  return (
    <section className="dash-panel" aria-labelledby="telegram-notifications">
      <h2 id="telegram-notifications">Telegram</h2>
      <p role="status">
        {settings.connected
          ? copy("បានភ្ជាប់ការជូនដំណឹង Telegram", "Telegram notifications connected")
          : copy("ភ្ជាប់ Telegram ដើម្បីទទួលការជូនដំណឹងអំពីព្រឹត្តិការណ៍ និងការទូទាត់។",
            "Connect Telegram for event and payment updates.")}
      </p>
      {error && <p role="alert">{copy("មិនអាចកែការកំណត់ Telegram បានទេ។", "Could not update Telegram settings.")}</p>}
      {link && <p><a className="dash-btn dash-btn-primary" href={link} target="_blank" rel="noreferrer">
        {copy("បើក Telegram ហើយចុច Start", "Open Telegram and press Start")}
      </a> {copy("តំណផុតកំណត់ក្នុង ៥ នាទី។", "The link expires in five minutes.")}</p>}
      <button className="dash-btn" type="button" onClick={update} disabled={busy}>
        {settings.connected ? copy("ផ្ដាច់ Telegram", "Disconnect Telegram")
          : link ? copy("បង្កើតតំណថ្មី", "Create a new link") : copy("ភ្ជាប់ Telegram", "Connect Telegram")}
      </button>
    </section>
  );
}
