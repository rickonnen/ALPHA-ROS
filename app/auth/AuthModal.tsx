"use client";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useState, useEffect } from "react";
import ForgotPasswordForm from "./ForgotPasswordForm";
import ResetCodeForm from "./ResetCodeForm";
import NewPasswordForm from "./NewPasswordForm";
import SuccessModal from "./SuccessModal";
import { useResetFlow } from "./useResetFlow";
import { useMagicLinkFlow } from "./useMagicLinkFlow";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const { screen, setScreen, forgotEmail, setForgotEmail, clearResetFlow } = useResetFlow();
  const [showSuccess, setShowSuccess] = useState(false);
  const magicLink = useMagicLinkFlow();

  useEffect(() => {
    setIsLogin(initialMode === "login");
  }, [initialMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[480px] h-full bg-[#EAE3D9] shadow-2xl p-6 flex flex-col">
      <div className="flex justify-between items-center">
          <magicLink.BackButton />
        <button onClick={onClose} className="self-end text-[#B47B65] font-bold text-sm flex items-center gap-1 hover:underline">
          <X size={16} /> Volver al inicio
        </button>
      </div>

        <magicLink.Screen />
 
        {!magicLink.isActive && (
          <>

        {screen === "auth" && (
          <div className="flex gap-4 mt-12 mb-8 justify-center bg-white p-1 rounded-full shadow-sm">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-8 py-2 rounded-full font-bold transition ${isLogin ? 'bg-[#1C3445] text-white' : 'text-gray-400'}`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-8 py-2 rounded-full font-bold transition ${!isLogin ? 'bg-[#1C3445] text-white' : 'text-gray-400'}`}
            >
              Crear cuenta
            </button>
          </div>
        )}

        <div className="overflow-y-auto pr-2">
          {screen === "forgot" ? (
            <ForgotPasswordForm
              onBack={() => setScreen("auth")}
              onCodeSent={(email) => { setForgotEmail(email); setScreen("code"); }}
            />
          ) : screen === "code" ? (
            <ResetCodeForm
              email={forgotEmail}
              onBack={() => setScreen("forgot")}
              onCodeVerified={() => setScreen("newpass")}
            />
          ) : screen === "newpass" ? (
            <NewPasswordForm
              email={forgotEmail}
              onBack={() => setScreen("code")}
              onSuccess={() => { clearResetFlow(); setShowSuccess(true); setIsLogin(true); }}
            />
          ) : isLogin ? (
            <LoginForm
              onSwitchToRegister={() => setIsLogin(false)}
              onClose={onClose}
              onForgotPassword={() => setScreen("forgot")}
              onMagicLink={magicLink.open}
            />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} onClose={onClose} />
          )}
        </div>
        </>
        )}
      </div>

      <SuccessModal
        isOpen={showSuccess}
        message="¡Tu contraseña fue actualizada correctamente!"
        onClose={() => { setShowSuccess(false); onClose(); }}
        autoCloseDuration={2000}
      />
    </div>
  );
}