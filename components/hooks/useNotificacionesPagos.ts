import { useEffect, useState } from "react";

export function useNotificacionesPagos(id_usuario: string) {
  const [prevPagos, setPrevPagos] = useState<any[]>([]);
  const [notificaciones, setNotificaciones] = useState<string[]>([]);

  useEffect(() => {
    const intervalo = setInterval(async () => {
      const res = await fetch(`/api/pagos?id_usuario=${id_usuario}`);
      const data = await res.json();

      
      const nuevos = data.filter((p: any) => {
        const anterior = prevPagos.find(x => x.id_detalle === p.id_detalle);

        return (
          anterior &&
          anterior.estado !== p.estado &&
          (p.estado === 2 || p.estado === 3)
        );
      });

      
      const mensajes = nuevos.map((p: any) =>
        p.estado === 2
          ? "✅ Tu pago fue realizado correctamente"
          : "❌ Tu pago fue rechazado"
      );

      if (mensajes.length > 0) {
        setNotificaciones((prev) => [...prev, ...mensajes]);
      }

      setPrevPagos(data);

    }, 5000); 

    return () => clearInterval(intervalo);
  }, [id_usuario, prevPagos]);

  return { notificaciones };
}