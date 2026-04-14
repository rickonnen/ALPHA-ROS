import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/auth/AuthContext";
import { PlanPublicacion } from "@prisma/client";
import { useRouter } from "next/navigation";

type EstadoModal =
  | "cerrado"
  | "descargarQR" 
  | "confirmacion_pago" 
  | "verificando_pago" 
  | "adjuntar_comprobante" 
  | "pendiente_pago"; 

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
      if (!user?.id || !archivoSeleccionado) return;
      
      setEstadoModal("verificando_pago"); // Feedback visual de carga

      try {
        const res = await fetch("/api/cobros/verificar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_usuario: user.id,
            id_plan: planId,
          }),
        });

        if (res.ok) {
          setYaPresionoAceptar(true);
          setEstadoPagoBD(1);
          setEstadoModal("verificando_pago");
        } 
      } catch (error) {
        console.error("Error en la verificación");
      }
    };


    //useEffect(() => {
    //  const yaFueNotificado = sessionStorage.getItem(`notificado_${planId}`);
    //  if (yaFueNotificado) {
    //    sessionStorage.removeItem(`notificado_${planId}`);
    //    router.push("/cobros/planes");
    //  }
    //}, [planId, router]);

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


    const [estadoPagoBD, setEstadoPagoBD] = useState<number | null>(null);
    useEffect(() => {
      const obtenerEstado = async () => {
        if (!user?.id) return;

        try {
          const res = await fetch(`/api/cobros/estado?userId=${user.id}`);
          const data = await res.json();
          
          console.log("Respuesta de la tabla de pagos:", data);
          
          setEstadoPagoBD(data.estado); 
        } catch (error) {
          console.error("Error al obtener estado:", error);
        }
      };

      obtenerEstado();
    }, [user?.id, planId]);

    const [hayPendientesEnTabla, setHayPendientesEnTabla] = useState(false);
    useEffect(() => {
      const verificarTablaPagos = async () => {
        if (!user?.id) return;
        try {
          const res = await fetch(`/api/cobros/estado?userId=${user.id}`);
          const data = await res.json();
          
          setHayPendientesEnTabla(data.tienePendientes); 
        } catch (error) {
          console.error(error);
        }
      };
      verificarTablaPagos();
    }, [user?.id]);
    
    const tienePagoPendiente = hayPendientesEnTabla;

    const alDarClickEnVerificarPrincipal = () => {
      console.log("Estado actual en BD:", estadoPagoBD);
      console.log("¿Tiene pago pendiente?:", tienePagoPendiente);
      if (tienePagoPendiente) {
        setEstadoModal("pendiente_pago"); 
        return;
      }

      if (archivoSeleccionado) {
        setEstadoModal("confirmacion_pago");
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

    const manejarSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.type.startsWith("image/")) {
          setArchivoSeleccionado(file);
        } else {
          alert("Por favor, selecciona solo archivos de imagen (PNG, JPG).");
        }
      }
    };
    const irAlPerfil = () => router.push(`/perfil?id=${user?.id}`);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    return {
      qrUrl,
      generandoQr,
      estadoModal,
      setEstadoModal,
      yaPresionoAceptar,
      manejarAceptarPago,
      alDarClickEnVerificarPrincipal,
      fileInputRef,
      tienePagoPendiente,
      manejarDescarga,
      irAlPerfil,
      archivoSeleccionado,  
      setArchivoSeleccionado,   
      manejarSeleccionArchivo,
   };
}