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
  const [settings, setSettings] = useState<Settings>({
    gmailEnabled: true,
    whatsappEnabled: true,
    gmailEmail: "usuario@gmail.com",
    whatsappNumber: "+591 73678412"
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/notifications?settings=true`);
      const data = await response.json();
      
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateSettings",
          settings: newSettings
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating settings:", error);
      return false;
    }
  }, []);

  const toggleGmail = useCallback(async (enabled: boolean) => {
    return await updateSettings({ gmailEnabled: enabled });
  }, [updateSettings]);

  const toggleWhatsapp = useCallback(async (enabled: boolean) => {
    return await updateSettings({ whatsappEnabled: enabled });
  }, [updateSettings]);

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