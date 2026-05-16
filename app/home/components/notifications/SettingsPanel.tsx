"use client";

import { useAuth } from "@/app/auth/AuthContext";
import { maskPhone, validatePhoneE164 } from "@/lib/phone/validate-phone";
import { Settings, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  onClose: () => void;
  gmailEnabled: boolean;
  whatsappEnabled: boolean;
  onGmailToggle: (enabled: boolean) => void;
  onWhatsappToggle: (enabled: boolean) => void;
};

export function SettingsPanel({
  onClose,
  gmailEnabled,
  whatsappEnabled,
  onGmailToggle,
  onWhatsappToggle,
}: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneSaved, setIsPhoneSaved] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<
    "success" | "error" | "warning" | ""
  >("");
  const { user: objUser } = useAuth();

  const USER_ID = objUser?.id;

  const showMessage = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setFeedbackType(type);
    setFeedbackMessage(message);

    setTimeout(() => {
      setFeedbackMessage("");
      setFeedbackType("");
    }, 4000);
  };

  useEffect(() => {
    const loadWhatsappStatus = async () => {
      setIsUpdating(true);

      try {
        const response = await fetch("/api/whatsapp/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: USER_ID,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          return;
        }

        if (data.exists && data.isVerified && data.phoneE164) {
          setPhoneNumber(data.phoneE164);
          setVerifiedPhone(data.phoneE164);
          setIsPhoneSaved(true);
          setIsChangingPhone(false);

          await onWhatsappToggle(Boolean(data.isActive));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsUpdating(false);
      }
    };

    loadWhatsappStatus();
  }, []);

  const handleGmailToggle = async (enabled: boolean) => {
    setIsUpdating(true);

    try {
      await onGmailToggle(enabled);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWhatsappToggle = async (enabled: boolean) => {
    if (enabled && !isPhoneSaved) {
      showMessage(
        "warning",
        "Primero debes registrar y verificar tu número de WhatsApp."
      );
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch("/api/whatsapp/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: USER_ID,
          enabled,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        showMessage("error", data.message);
        return;
      }

      await onWhatsappToggle(enabled);

      showMessage("success", data.message);
    } catch (error) {
      console.error(error);
      showMessage(
        "error",
        "No se pudo actualizar WhatsApp."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSavePhoneNumber = async () => {
    setIsUpdating(true);

    try {
      const result = validatePhoneE164(phoneNumber);

      if (!result.valid || !result.phoneE164) {
        showMessage(
          "error",
          result.error ?? "Número inválido."
        );
        return;
      }

      const response = await fetch("/api/whatsapp/verify-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: USER_ID,
          phone: result.phoneE164,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setIsPhoneSaved(false);
        showMessage("error", data.message ?? "No se pudo verificar el número.");
        return;
      }

      setPhoneNumber(data.phoneE164);
      setVerifiedPhone(data.phoneE164);
      setIsPhoneSaved(true);
      setIsChangingPhone(false);

      await onWhatsappToggle(true);

      showMessage(
        "success",
        "Número verificado. WhatsApp fue activado correctamente."
      );
    } catch (error) {
      console.error(error);
      showMessage(
        "error",
        "Error de red. Intenta nuevamente."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditPhoneNumber = () => {
    setIsChangingPhone(true);
    setPhoneNumber("");
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--notification-surface)] text-[var(--notification-text)] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 bg-[var(--notification-header)] text-[var(--notification-header-foreground)] px-4 py-3">
        <button
          onClick={onClose}
          className="hover:bg-[var(--notification-button-hover)] p-1 rounded-md transition-colors"
          title="Volver"
        >
          <ArrowLeft size={18} />
        </button>

        <Settings size={18} />
        <span className="font-semibold">
          Configuración de Notificaciones
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {feedbackMessage && (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium border ${feedbackType === "success"
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-900"
              : feedbackType === "error"
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-900"
                : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-900"
              }`}
          >
            {feedbackMessage}
          </div>
        )}
        <div className="flex items-center justify-between bg-[var(--notification-card)] p-3 rounded-xl">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn-icons-png.flaticon.com/512/5968/5968534.png"
              className="w-9 h-9"
              alt="Gmail"
            />

            <div>
              <p className="font-semibold">Gmail</p>
              <p className="text-sm text-[var(--notification-muted)]">
                usuario@gmail.com
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={gmailEnabled}
              onChange={(e) => handleGmailToggle(e.target.checked)}
              disabled={isUpdating}
              className="sr-only peer"
            />

            <div
              className={`w-11 h-6 bg-[var(--notification-muted)] rounded-full peer peer-checked:bg-[var(--notification-button)] transition ${
                isUpdating ? "opacity-50" : ""
              }`}
            />

            <div className="absolute left-1 top-1 w-4 h-4 bg-[var(--notification-surface)] rounded-full transition peer-checked:translate-x-5" />
          </label>
        </div>

        <div className="bg-[var(--notification-card)] p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
                className="w-9 h-9"
                alt="WhatsApp"
              />

              <div>
                <p className="font-semibold">WhatsApp</p>

                {isPhoneSaved && verifiedPhone && (
                  <p className="text-sm text-[var(--notification-muted)]">
                    {maskPhone(verifiedPhone)}
                  </p>
                )}
              </div>
            </div>

            <label
              className={`relative inline-flex items-center ${isPhoneSaved
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-60"
                }`}
            >
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) =>
                  handleWhatsappToggle(e.target.checked)
                }
                disabled={isUpdating || !isPhoneSaved}
                className="sr-only peer"
              />

              <div
                className={`w-11 h-6 bg-[var(--notification-muted)] rounded-full peer peer-checked:bg-green-600 transition ${
                  isUpdating ? "opacity-50" : ""
                }`}
              />

              <div className="absolute left-1 top-1 w-4 h-4 bg-[var(--notification-surface)] rounded-full transition peer-checked:translate-x-5" />
            </label>
          </div>

          {isPhoneSaved && !isChangingPhone ? (
            <div className="flex items-center justify-between mt-3 ml-12">
              <p className="text-xs text-[var(--notification-success)]">
                Número verificado y WhatsApp activado.
              </p>

              <button
                onClick={handleEditPhoneNumber}
                disabled={isUpdating}
                className="text-xs text-[var(--notification-button)] hover:underline px-2 py-1"
              >
                Cambiar
              </button>
            </div>
          ) : (
            <div className="bg-[var(--notification-warning-bg)] p-3 rounded-lg border border-[var(--notification-warning-border)] mt-3">
              <p className="text-xs text-[var(--notification-warning-text)] mb-2">
                Ingresa tu número para recibir notificaciones de WhatsApp:
              </p>

              <div className="flex flex-col gap-2">
                <input
                  type="tel"
                  placeholder="Ej: +59171234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 border border-[var(--notification-warning-border)] bg-[var(--notification-input-bg)] text-[var(--notification-text)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <button
                  onClick={handleSavePhoneNumber}
                  disabled={isUpdating}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
                >
                  {isUpdating ? "Verificando..." : "Guardar"}
                </button>
              </div>

              <p className="text-xs text-[var(--notification-muted)] mt-2">
                Formato: Código de país + número. Ej:
                +59171234567
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
