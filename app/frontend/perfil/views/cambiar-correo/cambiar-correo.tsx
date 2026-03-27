"use client";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff} from "lucide-react";

export default function CambiarCorreoView() {
  return (
    <div className="m-4">
      <HeaderCorreo />
      
    </div>
  );
}

function HeaderCorreo() {
  return (
    <CardHeader className="px-0 border-b border-white/15 pb-5">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <Mail className="h-6 w-6 text-white/70" />
        </div>

        <div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-white">
            Cambiar correo electrónico
          </CardTitle>
          <CardDescription className="mt-1 text-base text-white/70">
            Te enviaremos un código de verificación al nuevo correo.
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}
