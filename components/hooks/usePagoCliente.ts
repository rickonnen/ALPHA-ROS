import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useAuth } from "@/app/auth/AuthContext";
import { PlanPublicacion } from "@prisma/client";
import { useRouter } from "next/navigation";

export type EstadoModal =
  | "cerrado"
  | "confirmacion_pago"
  | "verificando_pago"
  | "pendiente_pago";

type PlanPago = Omit<PlanPublicacion, "precio_plan"> & {
  precio_plan: number;
};

export function usePagoCliente(plan: PlanPago, planId: string, modalidad: string) {
  const { user } = useAuth();
  const router = useRouter();
  
  // Estados de UI
  const [qrUrl, setQrUrl] = useState("");
  const [generandoQr, setGenerandoQr] = useState(true);
  const [estadoModal, setEstadoModal] = useState<EstadoModal>("cerrado");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  
  // Estados de Sincronización con BD
  const [estadoPagoBD, setEstadoPagoBD] = useState<number | null>(null);
  const [hayPendientesEnTabla, setHayPendientesEnTabla] = useState(false);
  
  //para los archiovs de imagenes
  const fileInputRef = useRef<HTMLInputElement>(null);

  //
  const [estaCargandoEstado, setEstaCargandoEstado] = useState(true);

  //invoca a route.ts de estado, su funcion GET para ver infomracion de detalle pago y devolver el estado
  //callback hace para que se mantenga en memoria 
  const refrescarEstadoGlobal = useCallback(async () => {
    //usuario no logueado termina aca el proceso, el user se toma del token de useAuth()
    if (!user?.id) return;
    try {
      //aqui se invoca 
      const res = await fetch(`/api/cobros/estado?userId=${user.id}`);
      //los datos del GET se convierten en data en un .json, como no necesitamos url de imagenes, no usamos formdata
      //recordatorio, aqui se tiene dos datos:  "id" y "estado"
      const data = await res.json();
      //cambiamos la variable para el estado que se obtuvo en data, si hay pagos pendientes devolverá 1, caso contrario null
      setEstadoPagoBD(data.estado);
      //lo mismo pero para true y false
      setHayPendientesEnTabla(data.tienePendientes);
    } catch (error) {
      console.error("Error al sincronizar estado:", error);
    }finally {
      setEstaCargandoEstado(false); 
    }
  }, [user?.id]);

  
  useEffect(() => {
    const inicializarDatos = async () => {
      if (!user?.id) return;
      
      // Cargar QR
      try {
        const resQr = await fetch(`/api/cobros/descargar?planId=${planId}&modalidad=${modalidad}`);
        const dataQr = await resQr.json();
        if (dataQr?.url) setQrUrl(dataQr.url);
      } catch (e) { console.error("Error QR:", e); }
      finally { setGenerandoQr(false); }

      // Cargar Estado de Pagos
      await refrescarEstadoGlobal();
    };

    inicializarDatos();
  }, [user?.id, planId, modalidad, refrescarEstadoGlobal]);

  const tienePagoPendiente = useMemo(() => {
    // Bloqueamos si hay pendientes generales o si el registro actual está en espera (Estado 1)
    return hayPendientesEnTabla || (estadoPagoBD !== null && estadoPagoBD === 1);
  }, [hayPendientesEnTabla, estadoPagoBD]);

  const alDarClickEnVerificarPrincipal = () => {
    if (tienePagoPendiente) {
      setEstadoModal("pendiente_pago");
      return;
    }

    if (archivoSeleccionado) {
      setEstadoModal("confirmacion_pago");
    } else {
      // Si no hay archivo, abrimos el selector automáticamente
      fileInputRef.current?.click();
    }
  };

  const manejarAceptarPago = async () => {
    if (!user?.id || !archivoSeleccionado) return;

    

    const formData = new FormData();
    formData.append("file", archivoSeleccionado);
    formData.append("id_usuario", user.id);
    formData.append("id_plan", planId);
    formData.append("tiempo_pago", modalidad);
    const nombreMes = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date());
    formData.append("mes_pago", nombreMes);

    try {
      const res = await fetch("/api/cobros/verificar", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        // Bloqueo instantáneo (Optimistic UI)
        setEstadoPagoBD(1);
        setHayPendientesEnTabla(true);
        setArchivoSeleccionado(null);
        
        // Refrescamos en 2 segundos para confirmar que la BD se actualizó bien
        setTimeout(refrescarEstadoGlobal, 2000);
      }
    } catch (error) {
      console.error("Error en el envío");
      setEstadoModal("cerrado");
    }

    setEstadoModal("verificando_pago");
  };

  // --- Helpers Adicionales ---
  const manejarDescarga = async () => {
    if (!qrUrl) return;
    const res = await fetch(qrUrl);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QR_Plan_${plan.nombre_plan}.png`;
    link.click();
  };

  const manejarSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) setArchivoSeleccionado(file);
      else alert("Selecciona una imagen (JPG/PNG)");
    }
  };

  const irAlPerfil = () => router.push(`/perfil?id=${user?.id}`);

  return {
    qrUrl,
    generandoQr,
    estadoModal,
    setEstadoModal,
    manejarAceptarPago,
    alDarClickEnVerificarPrincipal,
    fileInputRef,
    tienePagoPendiente,
    manejarDescarga,
    irAlPerfil,
    archivoSeleccionado,
    setArchivoSeleccionado,
    manejarSeleccionArchivo,
    estaCargandoEstado,
  };
}