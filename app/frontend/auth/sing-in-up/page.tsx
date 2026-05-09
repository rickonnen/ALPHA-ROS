"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import LoginForm from "../LoginForm";
import RegisterForm from "../RegisterForm";

export default function SignInUpPage() {
  const searchParams = useSearchParams();
  const initialMode = useMemo(
    () => (searchParams.get("mode") === "register" ? "register" : "login"),
    [searchParams]
  );

  const [isLogin, setIsLogin] = useState(initialMode === "login");

  return (
    <section className="min-h-screen bg-[#E7E1D7] px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[520px] rounded-2xl border border-[#DCCFBE] bg-[#F4EFE6] p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex gap-3 rounded-full bg-white p-1">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              isLogin ? "bg-[#1F3A4D] text-white" : "text-[#6F6A64]"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              !isLogin ? "bg-[#1F3A4D] text-white" : "text-[#6F6A64]"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </section>
  );
}
