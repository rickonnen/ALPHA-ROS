"use client"
import { useRouter } from "next/navigation"

export default function LinkedInDesvinculado() {
  const router = useRouter()

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center animate-in zoom-in-95 duration-200">
        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#0A66C2">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-2 text-slate-800 uppercase tracking-tight">
          LinkedIn desvinculado
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          Este LinkedIn estuvo vinculado a una cuenta anteriormente.
          Inicia sesion con tu cuenta principal (Google o correo)
          y reactiva la vinculacion desde tu perfil.
        </p>
        <button
          onClick={() => router.push("/")}
          className="w-full px-4 py-2 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-semibold shadow-md transition-colors"
        >
          Ir al inicio
        </button>
      </div>
    </div>
  )
}