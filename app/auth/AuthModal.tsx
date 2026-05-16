"use client";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useState, useEffect } from "react";
import ForgotPasswordForm from "./ForgotPasswordForm";
import ResetCodeForm from "./ResetCodeForm";
import NewPasswordForm from "./NewPasswordForm";
import SuccessModal from "./SuccessModal";
import { useResetFlow } from "./useResetFlow";
import { X } from "lucide-react";
import { useMagicLinkFlow } from "./useMagicLinkFlow";
import ReactivacionCuentaForm from "./ReactivacionCuentaForm";

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
  const [emailReactivacion, setEmailReactivacion] = useState("");

  useEffect(() => {
    setIsLogin(initialMode === "login");
  }, [initialMode]);

  if (!isOpen) return null;

  return (
    <div className="auth-system-theme fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[480px] h-full bg-[var(--auth-panel)] text-[var(--auth-text)] shadow-2xl p-6 flex flex-col">
      <div className="flex justify-between items-center">
          <magicLink.BackButton />
        
        <button onClick={onClose} className="self-end text-[var(--auth-secondary)] font-bold text-sm flex items-center gap-1 hover:underline">
          <X size={16} /> Volver al inicio
        </button>
      </div>

        <magicLink.Screen />


        {!magicLink.isActive && (
          <>


        {screen === "auth" && (
          <div className="flex gap-4 mt-12 mb-8 justify-center bg-[var(--auth-segment)] p-1 rounded-full shadow-sm">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-8 py-2 rounded-full font-bold transition ${isLogin ? 'bg-[var(--auth-tab-active)] text-[var(--auth-tab-active-foreground)]' : 'text-[var(--auth-muted)]'}`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-8 py-2 rounded-full font-bold transition ${!isLogin ? 'bg-[var(--auth-tab-active)] text-[var(--auth-tab-active-foreground)]' : 'text-[var(--auth-muted)]'}`}
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
          ) : screen === "reactivacion" ? (
            
            <ReactivacionCuentaForm
              onBack={() => setScreen("auth")}
              emailPrellenado={emailReactivacion}
            />
          ) : isLogin ? (
            <LoginForm
              onSwitchToRegister={() => setIsLogin(false)}
              onClose={onClose}
              onForgotPassword={() => setScreen("forgot")}
              onMagicLink={magicLink.open}
              onReactivarCuenta={(email) => {
                setEmailReactivacion(email || "");
                setScreen("reactivacion");
              }}
            />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} onClose={onClose} onMagicLink={magicLink.open} />
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
      <style jsx>{`
        .auth-system-theme {
          color-scheme: light;
          --auth-panel: #eae3d9;
          --auth-card: #ffffff;
          --auth-card-soft: #f4efe6;
          --auth-segment: #ffffff;
          --auth-field-bg: #ffffff;
          --auth-field-error-bg: #fee2e2;
          --auth-field-disabled-bg: #f3f4f6;
          --auth-field-border: #d1d5db;
          --auth-field-error-border: #ef4444;
          --auth-border: #dddddd;
          --auth-text: #1f2937;
          --auth-text-strong: #0f172a;
          --auth-text-soft: #4b5563;
          --auth-muted: #6b7280;
          --auth-muted-strong: #374151;
          --auth-icon: #9ca3af;
          --auth-primary: #1c3445;
          --auth-primary-strong: #1f3a4d;
          --auth-primary-soft: #1f3a4d22;
          --auth-primary-foreground: #ffffff;
          --auth-tab-active: #1c3445;
          --auth-tab-active-foreground: #ffffff;
          --auth-secondary: #c26e5a;
          --auth-secondary-action: #c85a4f;
          --auth-secondary-hover: #a86b55;
          --auth-secondary-soft: #fdf0ed;
          --auth-disabled: #e5a89f;
          --auth-success: #16a34a;
          --auth-success-strong: #22c55e;
          --auth-success-soft: #4caf5022;
          --auth-danger: #ef4444;
          --auth-danger-soft: #fee2e2;
          --auth-warning: #b45309;
          --auth-warning-soft: #fef3c7;
          --auth-counter-bg: #fef2f2;
          --auth-otp-bg: #4a6878;
          --auth-otp-disabled-bg: #4a687866;
        }

        @media (prefers-color-scheme: dark) {
          .auth-system-theme {
            color-scheme: dark;
            --auth-panel: #292929;
            --auth-card: #333333;
            --auth-card-soft: #333333;
            --auth-segment: #474747;
            --auth-field-bg: #333333;
            --auth-field-error-bg: #4a2626;
            --auth-field-disabled-bg: #3d3d3d;
            --auth-field-border: #1f1f1f;
            --auth-field-error-border: #ef4444;
            --auth-border: #1f1f1f;
            --auth-text: #ebebeb;
            --auth-text-strong: #ffffff;
            --auth-text-soft: #d8d8d8;
            --auth-muted: #a3a3a3;
            --auth-muted-strong: #cfcfcf;
            --auth-icon: #c7c7c7;
            --auth-primary: #474747;
            --auth-primary-strong: #474747;
            --auth-primary-soft: #ffffff14;
            --auth-primary-foreground: #ebebeb;
            --auth-tab-active: #f2f2f2;
            --auth-tab-active-foreground: #292929;
            --auth-secondary: #c26e5a;
            --auth-secondary-action: #c26e5a;
            --auth-secondary-hover: #d08370;
            --auth-secondary-soft: #3b2d2a;
            --auth-disabled: #6f5d57;
            --auth-success: #52a66c;
            --auth-success-strong: #5fd37c;
            --auth-success-soft: #245437;
            --auth-danger: #ff6b6b;
            --auth-danger-soft: #4a2626;
            --auth-warning: #f0c06f;
            --auth-warning-soft: #4a3a1e;
            --auth-counter-bg: #3d2b2b;
            --auth-otp-bg: #474747;
            --auth-otp-disabled-bg: #3d3d3d;
          }
        }
      `}</style>
    </div>
  );
}
