import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/auth/AuthContext";

interface Settings {
  gmailEnabled: boolean;
  whatsappEnabled: boolean;
  gmailEmail: string;
  whatsappNumber: string;
}

export function useNotificationSettings() {
  const { user } = useAuth();

  const [settings] = useState<Settings>({
    gmailEnabled: true,
    whatsappEnabled: true,
    gmailEmail: "usuario@gmail.com",
    whatsappNumber: "+591 73678412"
  });

  const [isLoading] = useState(false);

  const loadSettings = useCallback(async () => {
    // no-op (ya no se usa API mock)
  }, []);

  const updateSettings = useCallback(async (_newSettings: Partial<Settings>) => {
    return true; // no-op
  }, []);

  const toggleGmail = useCallback(async (_enabled: boolean) => true, []);
  const toggleWhatsapp = useCallback(async (_enabled: boolean) => true, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    updateSettings,
    toggleGmail,
    toggleWhatsapp
  };
}