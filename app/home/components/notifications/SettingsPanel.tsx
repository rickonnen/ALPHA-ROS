"use client";
import { Settings, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

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
  onWhatsappToggle 
}: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isPhoneSaved, setIsPhoneSaved] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("user_whatsapp_number");
    if (saved !== null && saved !== "") {
      setPhoneNumber(saved);
      setIsPhoneSaved(true);
    }
  }, []);

  const handleGmailToggle = async (enabled: boolean) => {
    setIsUpdating(true);
    await onGmailToggle(enabled);
    setIsUpdating(false);
  };

  const handleWhatsappToggle = async (enabled: boolean) => {
    setIsUpdating(true);
    await onWhatsappToggle(enabled);
    setIsUpdating(false);
  };

  const handleSavePhoneNumber = () => {
    if (phoneNumber && phoneNumber.length > 8) {
      localStorage.setItem("user_whatsapp_number", phoneNumber);
      setIsPhoneSaved(true);
      alert("✅ Número de WhatsApp guardado correctamente");
    } else {
      alert("❌ Por favor ingresa un número válido (ej: +59171234567)");
    }
  };

  const handleEditPhoneNumber = () => {
    setIsPhoneSaved(false);
    setPhoneNumber("");
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl overflow-hidden">
      {/* Header con botón de volver */}
      <div className="flex items-center gap-2 bg-slate-700 text-white px-4 py-3">
        <button
          onClick={onClose}
          className="hover:bg-slate-600 p-1 rounded-md transition-colors"
          title="Volver"
        >
          <ArrowLeft size={18} />
        </button>
        <Settings size={18} />
        <span className="font-semibold">Configuración de Notificaciones</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Gmail */}
        <div className="flex items-center justify-between bg-gray-100 p-3 rounded-xl">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn-icons-png.flaticon.com/512/5968/5968534.png"
              className="w-9 h-9"
              alt="Gmail"
            />
            <div>
              <p className="font-semibold">Gmail</p>
              <p className="text-sm text-gray-500">usuario@gmail.com</p>
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
            <div className={`w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition ${isUpdating ? "opacity-50" : ""}`}></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
          </label>
        </div>

        {/* WhatsApp */}
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
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) => handleWhatsappToggle(e.target.checked)}
                disabled={isUpdating}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition ${isUpdating ? "opacity-50" : ""}`}></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
            </label>
          </div>

          {isPhoneSaved ? (
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-500 ml-10">{phoneNumber}</p>
              <button
                onClick={handleEditPhoneNumber}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline px-2 py-1"
              >
                Cambiar
              </button>
            </div>
          ) : (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-3">
              <p className="text-xs text-yellow-700 mb-2">
                Ingresa tu número para recibir notificaciones de WhatsApp:
              </p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="Ej: +59171234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 px-3 py-2 border border-yellow-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSavePhoneNumber}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition"
                >
                  Guardar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Formato: Código de país + número (ej: +59171234567)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}