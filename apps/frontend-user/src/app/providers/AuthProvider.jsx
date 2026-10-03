import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AuthProvider({ children }) {
  const initializeSession = useAuthStore((state) => state.initializeSession);
  useEffect(() => { initializeSession(); }, [initializeSession]);
  return children;
}
