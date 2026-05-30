import { useState, useEffect, useCallback } from "react";

export function useEmailNotificationStatus(userId: string | undefined) {
  const [gmailEnabled, setGmailEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const cached = localStorage.getItem(`gmail_pref_${userId}`);
    if (cached !== null) {
      setGmailEnabled(cached === "true");
      return;
    }

    const loadStatus = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/email/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        if (data.ok) {
          setGmailEnabled(data.isActive);
          localStorage.setItem(`gmail_pref_${userId}`, String(data.isActive));
        }
      } catch (err) {
        console.error("Error al cargar estado de Gmail:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
  }, [userId]);

  const toggleGmail = useCallback(
    async (enabled: boolean) => {
      if (!userId) return;
      setIsLoading(true);
      setGmailEnabled(enabled);
      localStorage.setItem(`gmail_pref_${userId}`, String(enabled));
      try {
        const res = await fetch("/api/email/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, enabled }),
        });
        const data = await res.json();
        if (!data.ok) {
          setGmailEnabled(!enabled);
          localStorage.setItem(`gmail_pref_${userId}`, String(!enabled));
          console.error("Error al actualizar Gmail:", data.message);
        }
      } catch (err) {
        setGmailEnabled(!enabled);
        localStorage.setItem(`gmail_pref_${userId}`, String(!enabled));
        console.error("Error al actualizar Gmail:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  return { gmailEnabled, isLoading, toggleGmail };
}