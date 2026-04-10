import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth/AuthContext";
import { PlanPublicacion } from "@prisma/client";
import { useRouter } from "next/navigation";

type EstadoModal =
  | "cerrado"
  | "confirmacion"
  | "verificando"
  | "procesando"
  | "ya_pendiente";

  type PlanPago = Omit<PlanPublicacion, "precio_plan"> & {
  precio_plan: number;
  };
  
export function usePagoCliente(plan: PlanPago, planId: string){
    const { user } = useAuth();
    const [qrUrl, setQrUrl] = useState("");
    const [generandoQr, setGenerandoQr] = useState(true);
    const router = useRouter();
    const [estadoModal, setEstadoModal] = useState<EstadoModal>("cerrado");

    // Manejo fluido de estados de pago
    const [yaPresionoAceptar, setYaPresionoAceptar] = useState(false);
    const manejarAceptarPago = async () => {
      if (!user?.id) return;
      setEstadoModal("verificando");
      try {
        const res = await fetch("/api/cobros/verificar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_usuario: user.id,
            id_plan: planId,
          }),
        });

        if (res.ok) {
          sessionStorage.setItem(`notificado_${planId}`, "true");
          setYaPresionoAceptar(true);
          setEstadoModal("procesando");
        } else {
          setEstadoModal("ya_pendiente");
        }
      } catch (error) {
        setEstadoModal("ya_pendiente");
      }
    };

  useEffect(() => {
    const yaFueNotificado = sessionStorage.getItem(`notificado_${planId}`);
    if (yaFueNotificado) {
      sessionStorage.removeItem(`notificado_${planId}`);
      router.push("/cobros/planes");
    }
  }, [planId, router]);

    // Fetch solo para el QR
    useEffect(() => {
      const cargarQr = async () => {
            try {
            const resQr = await fetch(`/api/cobros/descargar?planId=${planId}`);
            const dataQr = await resQr.json();
            if (dataQr && dataQr.url) {
            setQrUrl(dataQr.url);
            }
        } catch (error) {
            console.error("Error al cargar QR:", error);
        } finally {
            setGenerandoQr(false);
        }
    };
    cargarQr();
    }, [planId]);

      //funcion para ver que modal mostrar al dar click al boton verificar pago
    const alDarClickEnVerificarPrincipal = () => {
        if (yaPresionoAceptar) {
        // Si ya aceptó antes en esta visita, enviara al modal de procesando
        setEstadoModal("procesando"); 
        } else {
        // Si es la primera vez mostrara el modal para confirmar o rechazar del modal de confirmacion
        setEstadoModal("confirmacion");
        }
    };

    const manejarDescarga = async () => {
      if (!qrUrl) return;
      const respuestaImagen = await fetch(qrUrl);
      const blob = await respuestaImagen.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlBlob;
      link.download = `QR_Plan_${plan.nombre_plan}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

  


  const irAlPerfil = () => router.push(`/perfil?id=${user?.id}`);

    return {
      qrUrl,
      generandoQr,
      estadoModal,
      setEstadoModal,
      yaPresionoAceptar,
      manejarAceptarPago,
      alDarClickEnVerificarPrincipal,
      manejarDescarga,
      irAlPerfil,
   };
}