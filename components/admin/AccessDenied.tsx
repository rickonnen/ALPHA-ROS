// components/admin/AccessDenied.tsx
import { Lock, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center bg-card rounded-xl border-2 border-dashed border-border p-12 shadow-inner">
      <div className="bg-destructive/10 p-5 rounded-full mb-6">
        <Lock className="w-12 h-12 text-destructive" />
      </div>
      <h3 className="text-2xl font-black text-foreground mb-4 uppercase tracking-tighter">
        ACCESO RESTRINGIDO
      </h3>
      <p className="text-muted-foreground max-w-sm mb-8 font-medium">
        Tu cuenta actual no cuenta con los privilegios de administrador necesarios para gestionar esta sección.
      </p>
      <Button 
        onClick={() => window.location.href = "/"}
        variant="default"
        className="font-bold px-8"
      >
        <Home className="mr-2 h-4 w-4" /> VOLVER AL PORTAL
      </Button>
    </div>
  )
}