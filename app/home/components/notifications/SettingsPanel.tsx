"use client";

import { useAuth } from "@/app/auth/AuthContext";
import { maskPhone, validatePhoneE164 } from "@/lib/phone/validate-phone";
import { Settings, ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Props = {
  onClose: () => void;
  gmailEnabled: boolean;
  whatsappEnabled: boolean;
  onGmailToggle: (enabled: boolean) => Promise<void> | void;
  onWhatsappToggle: (enabled: boolean) => Promise<void> | void;
};

type UserPhone = {
  idTelefono: number;
  phoneE164: string;
  isVerified: boolean;
  isSelected: boolean;
};

type WhatsappStatusCache = {
  exists: boolean;
  isActive: boolean;
  isVerified: boolean;
  phoneE164: string | null;
  idTelefono: number | null;
  phones: UserPhone[];
  cachedAt: number;
};

const CACHE_TTL = 1000 * 30;

function getWhatsappCacheKey(userId: string) {
  return `whatsapp-status:${userId}`;
}

function getCachedWhatsappStatus(userId: string): WhatsappStatusCache | null {
  try {
    const raw = sessionStorage.getItem(getWhatsappCacheKey(userId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as WhatsappStatusCache;

    if (Date.now() - parsed.cachedAt > CACHE_TTL) {
      sessionStorage.removeItem(getWhatsappCacheKey(userId));
      return null;
    }

    return {
      ...parsed,
      phones: parsed.phones ?? [],
      idTelefono: parsed.idTelefono ?? null,
    };
  } catch {
    return null;
  }
}

function setCachedWhatsappStatus(
  userId: string,
  data: Omit<WhatsappStatusCache, "cachedAt">
) {
  sessionStorage.setItem(
    getWhatsappCacheKey(userId),
    JSON.stringify({
      ...data,
      cachedAt: Date.now(),
    })
)}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || local.length <= 2) return email;
  const masked = local.slice(0, 2) + "*".repeat(local.length - 4) + local.slice(-2);
  return `${masked}@${domain}`;
}

export function SettingsPanel({
  onClose,
  gmailEnabled,
  whatsappEnabled,
  onGmailToggle,
  onWhatsappToggle,
}: Props) {
  const { user: objUser } = useAuth();
  const USER_ID = objUser?.id;

  const [isUpdating, setIsUpdating] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneSaved, setIsPhoneSaved] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [registeredPhones, setRegisteredPhones] = useState<UserPhone[]>([]);
  const [selectedPhoneId, setSelectedPhoneId] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isWhatsappLoading, setIsWhatsappLoading] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    "success" | "error" | "warning" | ""
  >("");

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

  const applyWhatsappStatus = useCallback(
    async (data: WhatsappStatusCache | Omit<WhatsappStatusCache, "cachedAt">) => {
      const phones = data.phones ?? [];

      setRegisteredPhones(phones);
      setSelectedPhoneId(data.idTelefono ?? null);

      if (!data.exists) {
        setIsPhoneSaved(false);
        setVerifiedPhone("");
        setPhoneNumber("");
        setIsChangingPhone(phones.length === 0);
        await onWhatsappToggle(false);
        return;
      }

      if (data.isVerified && data.phoneE164) {
        setPhoneNumber(data.phoneE164);
        setVerifiedPhone(data.phoneE164);
        setIsPhoneSaved(true);
        setIsChangingPhone(false);
        await onWhatsappToggle(Boolean(data.isActive));
        return;
      }

      setIsPhoneSaved(false);
      setVerifiedPhone("");
      setPhoneNumber("");
      setIsChangingPhone(phones.length === 0);
      await onWhatsappToggle(false);
    },
    [onWhatsappToggle]
  );

  useEffect(() => {
    if (!USER_ID) return;

    const loadWhatsappStatus = async () => {
      const cached = getCachedWhatsappStatus(USER_ID);

      if (cached) {
        await applyWhatsappStatus(cached);
        return;
      }

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
          await applyWhatsappStatus({
            exists: false,
            isActive: false,
            isVerified: false,
            phoneE164: null,
            idTelefono: null,
            phones: [],
          });
          return;
        }

        const statusData = {
          exists: Boolean(data.exists),
          isActive: Boolean(data.isActive),
          isVerified: Boolean(data.isVerified),
          phoneE164: data.phoneE164 ?? null,
          idTelefono: data.idTelefono ?? null,
          phones: data.phones ?? [],
        };

        setCachedWhatsappStatus(USER_ID, statusData);
        await applyWhatsappStatus(statusData);
      } catch (error) {
        console.error(error);
        showMessage("error", "No se pudo cargar el estado de WhatsApp.");
      } finally {
        setIsUpdating(false);
      }
    };

    loadWhatsappStatus();
  }, [USER_ID, applyWhatsappStatus]);

  const handleGmailToggle = async (enabled: boolean) => {
    setIsUpdating(true);

    try {
      await onGmailToggle(enabled);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectRegisteredPhone = async (idTelefono: number) => {
    if (!USER_ID) {
      showMessage("error", "Usuario no autenticado.");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch("/api/whatsapp/select-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: USER_ID,
          idTelefono,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        showMessage("error", data.message ?? "No se pudo seleccionar el número.");
        return;
      }

      const updatedPhones = registeredPhones.map((phone) => ({
        ...phone,
        isSelected: phone.idTelefono === data.idTelefono,
      }));

      const updatedStatus = {
        exists: true,
        isActive: true,
        isVerified: true,
        phoneE164: data.phoneE164,
        idTelefono: data.idTelefono,
        phones: updatedPhones,
      };

      setCachedWhatsappStatus(USER_ID, updatedStatus);
      await applyWhatsappStatus(updatedStatus);

      showMessage("success", data.message ?? "Número seleccionado.");
    } catch (error) {
      console.error(error);
      showMessage("error", "No se pudo seleccionar el número.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWhatsappToggle = async (enabled: boolean) => {
    if (!USER_ID) {
      showMessage("error", "Usuario no autenticado.");
      return;
    }

    if (enabled && !isPhoneSaved) {
      showMessage(
        "warning",
        "Primero debes seleccionar o verificar un número de WhatsApp."
      );
      return;
    }

    setIsWhatsappLoading(true);

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
        showMessage("error", data.message ?? "No se pudo actualizar WhatsApp.");
        return;
      }

      const updatedPhones = registeredPhones.map((phone) => ({
        ...phone,
        isSelected: phone.idTelefono === selectedPhoneId,
      }));

      const updatedStatus = {
        exists: true,
        isActive: Boolean(data.isActive),
        isVerified: true,
        phoneE164: data.phoneE164 ?? verifiedPhone,
        idTelefono: selectedPhoneId,
        phones: updatedPhones,
      };

      setCachedWhatsappStatus(USER_ID, updatedStatus);
      await applyWhatsappStatus(updatedStatus);

      showMessage("success", data.message);
    } catch (error) {
      console.error(error);
      showMessage("error", "No se pudo actualizar WhatsApp.");
    } finally {
      setIsWhatsappLoading(false);
    }
  };

  const handleSavePhoneNumber = async () => {
    if (!USER_ID) {
      showMessage("error", "Usuario no autenticado.");
      return;
    }

    if (
      totalPhonesCount >= 3 &&
      !isExistingPhone
    ) {
      showMessage(
        "warning",
        "Solo puedes registrar hasta 3 números."
      );
      return;
    }

    setIsUpdating(true);

    try {
      const result = validatePhoneE164(phoneNumber);

      if (!result.valid || !result.phoneE164) {
        showMessage("error", result.error ?? "Número inválido.");
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

      const existingPhone = registeredPhones.find(
        (phone) => phone.phoneE164 === data.phoneE164
      );

      const newPhone: UserPhone = {
        idTelefono: data.idTelefono,
        phoneE164: data.phoneE164,
        isVerified: true,
        isSelected: true,
      };

      const updatedPhones = [
        newPhone,
        ...registeredPhones
          .filter(
            (phone) =>
              phone.idTelefono !== data.idTelefono &&
              phone.phoneE164 !== data.phoneE164
          )
          .map((phone) => ({
            ...phone,
            isSelected: false,
          })),
      ].slice(0, 3);

      const updatedStatus = {
        exists: true,
        isActive: true,
        isVerified: true,
        phoneE164: data.phoneE164,
        idTelefono: data.idTelefono,
        phones: updatedPhones,
      };

      setCachedWhatsappStatus(USER_ID, updatedStatus);
      await applyWhatsappStatus(updatedStatus);

      showMessage(
        "success",
        data.message ?? "Número verificado. WhatsApp fue activado correctamente."
      );
    } catch (error) {
      console.error(error);
      showMessage("error", "Error de red. Intenta nuevamente.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditPhoneNumber = () => {
    setIsChangingPhone(true);
    setPhoneNumber("");
  };
  const verifiedPhonesCount = registeredPhones.filter(
    (phone) => phone.isVerified
  ).length;

  const totalPhonesCount = registeredPhones.length;

  const canAddNewPhone = totalPhonesCount < 3;

  const isExistingPhone = registeredPhones.some(
    (phone) => phone.phoneE164 === phoneNumber
  );

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 bg-slate-700 text-white px-4 py-3">
        <button
          onClick={onClose}
          className="hover:bg-slate-600 p-1 rounded-md transition-colors"
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
              ? "bg-green-50 text-green-700 border-green-200"
              : feedbackType === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-yellow-50 text-yellow-700 border-yellow-200"
              }`}
          >
            {feedbackMessage}
          </div>
        )}

        <div className="flex items-center justify-between bg-gray-100 p-3 rounded-xl">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn-icons-png.flaticon.com/512/5968/5968534.png"
              className="w-9 h-9"
              alt="Gmail"
            />

            <div>
              <p className="font-semibold">Gmail</p>
              <p className="text-sm text-gray-500">
                {objUser?.email ? maskEmail(objUser.email) : "Sin correo"}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={gmailEnabled}
              onChange={(e) => handleGmailToggle(e.target.checked)}
              disabled={isUpdating || !USER_ID}
              className="sr-only peer"
            />

            <div
              className={`w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition ${isUpdating ? "opacity-50" : ""
                }`}
            />

            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5" />
          </label>
        </div>

        <div className="bg-gray-100 p-3 rounded-xl">
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
                  <p className="text-sm text-gray-500">
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
                onChange={(e) => handleWhatsappToggle(e.target.checked)}
                disabled={
                  isWhatsappLoading ||
                  isUpdating ||
                  !isPhoneSaved ||
                  !USER_ID
                }
                className="sr-only peer"
              />

              <div
                className={`
      w-14 h-7 rounded-full transition-all duration-300
      ${whatsappEnabled
                    ? "bg-green-600"
                    : "bg-gray-300"
                  }
      ${isWhatsappLoading ? "opacity-70" : ""}
    `}
              >
                <div
                  className={`
        absolute top-1 left-1 w-5 h-5 bg-white rounded-full
        transition-transform duration-300 flex items-center justify-center
        ${whatsappEnabled ? "translate-x-7" : ""}
      `}
                >
                  {isWhatsappLoading && (
                    <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>
            </label>
          </div>

          {isWhatsappLoading && (
            <p className="text-xs text-gray-500 mt-2 ml-12 animate-pulse">
              {whatsappEnabled
                ? "Desactivando WhatsApp..."
                : "Activando WhatsApp..."}
            </p>
          )}

          {registeredPhones.map((phone) => (
            <div
              key={phone.idTelefono}
              className={`rounded-lg border p-3 transition ${phone.idTelefono === selectedPhoneId
                ? "bg-green-50 border-green-500"
                : "bg-white border-gray-200"
                }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    {maskPhone(phone.phoneE164)}
                  </span>

                  <span
                    className={`text-xs ${phone.isVerified
                      ? "text-green-600"
                      : "text-yellow-600"
                      }`}
                  >
                    {phone.isVerified
                      ? "Número verificado"
                      : "Número pendiente de verificación"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {phone.isVerified ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectRegisteredPhone(phone.idTelefono)
                      }
                      disabled={isUpdating}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${phone.idTelefono === selectedPhoneId
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {phone.idTelefono === selectedPhoneId
                        ? "Activo"
                        : "Usar"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneNumber(phone.phoneE164);
                        setSelectedPhoneId(phone.idTelefono);
                        setIsChangingPhone(true);

                        showMessage(
                          "warning",
                          "Presiona guardar para verificar este número."
                        );
                      }}
                      disabled={isUpdating}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-yellow-500 text-white hover:bg-yellow-600 transition"
                    >
                      Verificar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isPhoneSaved && !isChangingPhone ? (
            <div className="flex items-center justify-between mt-3 ml-12">
              <p className="text-xs text-green-700">
                Número verificado.
              </p>

              {canAddNewPhone ? (
                <button
                  onClick={handleEditPhoneNumber}
                  disabled={isUpdating}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline px-2 py-1"
                >
                  Agregar otro
                </button>
              ) : (
                <span className="text-xs text-gray-400 px-2 py-1">
                  Máximo 3 números
                </span>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-3">
              <p className="text-xs text-yellow-700 mb-2">
                Ingresa tu número para recibir notificaciones de WhatsApp:
              </p>

              <div className="flex flex-col gap-2">
                <input
                  type="tel"
                  placeholder="Ej: +59171234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isUpdating || !USER_ID || !canAddNewPhone}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <button
                  onClick={handleSavePhoneNumber}
                  disabled={isUpdating || !USER_ID ||  (!canAddNewPhone && !isExistingPhone)}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
                >
                  {!canAddNewPhone
                    ? "Máximo 3 números"
                    : isUpdating
                      ? "Verificando..."
                      : "Guardar"}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Formato: Código de país + número. Ej: +59171234567
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}