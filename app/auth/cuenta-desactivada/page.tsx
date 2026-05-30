"use client"
import { useRouter } from "next/navigation"
import { UserX, X } from "lucide-react"
import { useRef } from "react"

export default function CuentaDesactivada() {
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null)

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      router.push("/")
    }
  }
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] animate-in fade-in duration-200"
      onClick={handleBackdrop}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center animate-in zoom-in-95 duration-200 relative"
      >
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserX size={32} className="text-[#C26E5A]" />
        </div>
        <h3 className="text-lg font-bold mb-2 text-slate-800 uppercase tracking-tight">
          Tu cuenta está desactivada
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          Para poder reactivar tu cuenta, presiona{" "}
          <strong
            className="text-[#C26E5A] cursor-pointer underline"
            onClick={() => router.push("/auth/reactivacion-cuenta")}
          >
            ¿Deseas reactivar tu cuenta?
          </strong>
        </p>
      </div>
    </div>
  )
}