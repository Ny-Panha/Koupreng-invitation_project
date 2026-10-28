export function toast(message, type = "success") {
  if (typeof window === "undefined") return;
  const detail =
    message && typeof message === "object"
      ? { ...message, message: String(message.message || message.description || message.title || ""), type: message.type || type }
      : { message: String(message), type };
  window.dispatchEvent(new CustomEvent("koupreng:toast", { detail }));
}

toast.success = (msg) => toast(msg, "success");
toast.error = (msg) => toast(msg, "error");
toast.warning = (msg) => toast(msg, "warning");
toast.info = (msg) => toast(msg, "info");

export default toast;
