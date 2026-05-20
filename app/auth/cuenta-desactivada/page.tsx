"use client"
import { useRouter } from "next/navigation"
import { UserX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CuentaDesactivada() {
  const router = useRouter()
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center animate-in zoom-in-95 duration-200">
        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserX size={32} className="text-[#C26E5A]" />
        </div>
        <h3 className="text-lg font-bold mb-2 text-slate-800 uppercase tracking-tight">
          Cuenta desactivada
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          Tu cuenta está desactivada y no puedes iniciar sesión.
          Comunícate con nuestro equipo de soporte técnico para reactivar el acceso.
        </p>
        <Button
          onClick={() => router.push("/")}
          className="w-full bg-[#C26E5A] hover:bg-[#a85a49] text-white text-sm font-semibold"
        >
          Ir al inicio
        </Button>
      </div>
    </div>
  )
}