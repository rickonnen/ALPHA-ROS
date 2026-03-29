'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function PaginaSectorPagos() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando parámetros de pago...</div>}>
      <ContenidoPaginaCobros />
    </Suspense>
  );
}
//los amigos de rodrigo no hicieron login asi que wamos a simular pe


function ContenidoPaginaCobros() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId') || '1';

  // Estados de información
  const [mensaje, setMensaje] = useState('Esperando interacción...');
  const [titulo, setTitulo] = useState('Estado del Pago');
  const [nombrePlan, setNombrePlan] = useState('');
  const [descripcionPlan, setDescripcionPlan] = useState('');
  const [totalAPagar, setTotalAPagar] = useState<number>(0);
  const [qrUrl, setQrUrl] = useState<string>('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [estaCargando, setEstaCargando] = useState(true);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setEstaCargando(true); 
      try {
        // Ejecutamos ambas peticiones en paralelo para ganar velocidad
        const [resPlan, resQr] = await Promise.all([
            fetch(`/backend/cobros/getplan?planId=${planId}`),
            fetch(`/backend/cobros/descargar?planId=${planId}`) 
        ]);

        const dataPlan = await resPlan.json();
        const dataQr = await resQr.json();
        if (dataQr && dataQr.url) {
            setQrUrl(dataQr.url); 
        } else {
            console.error("No se recibió URL de QR válida");
        }
        if (dataPlan && !dataPlan.error) {
          setNombrePlan(dataPlan.nombre);
          setTotalAPagar(dataPlan.total);
          setDescripcionPlan(dataPlan.descripcion);
        }

        if (dataQr.url) {
          setQrUrl(dataQr.url);
        }
      } catch (error) {
        console.error("Error en la carga inicial:", error);
        setMensaje("Error al conectar con el servidor.");
      } finally {
        setTimeout(() => setEstaCargando(false), 800);
      }
    };

    cargarDatosIniciales();
  }, [planId]);

  const USUARIO_SIMULADO_ID = "4ce5fb58-95d8-4b43-8e49-4d75711f1837";
    const manejarVerificacion = async () => {
    try {
      const res = await fetch('/backend/cobros/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id_usuario: USUARIO_SIMULADO_ID, 
          id_plan: planId 
        }),
      });

      const data = await res.json();

      // Seteamos los estados para el modal
      setTitulo(data.titulo);
      setMensaje(data.mensaje);
      setMostrarModal(true);

    } catch (error) {
      console.error("Error al registrar:", error);
      setTitulo("Verificando Pago");
      setMensaje("El pago se esta procesando, esto puedo durar algunas horas");
      setMostrarModal(true);
    }
  };

  const manejarDescarga = async () => {
    if (!qrUrl) return;
    setMensaje('Iniciando descarga de QR...');
    const respuestaImagen = await fetch(qrUrl);
    const blob = await respuestaImagen.blob();
    const urlBlob = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlBlob;
    link.download = `QR_Plan_${nombrePlan}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMensaje('QR guardado en tu dispositivo.');
  };

  // PANTALLA DE CARGA (discutir con qas si mantener o nel)
  if (estaCargando) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-geist">
        <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
          <div className="h-full bg-black animate-progress-bar"></div>
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">
          cargando la pagina, por favor espere
        </p>
      </div>
    );
  }

  return (
     <div className="min-h-screen flex">

    {/* DIV DE LA IZQUIERDA */}
    <div className="w-[60%] bg-gray-100 p-12 flex flex-col justify-between min-h-screen"> 
      
      {/* Contenedor superior para Título y Descripción */}
      <div>
        <h1 className="text-4xl font-bold ml-10 mt-15 text-gray-800 font-mono"> {nombrePlan} </h1>
        
        <div className="border-gray-400 p-6 rounded-md mt-20">
          {/* Label de Descripción*/}
          <p className="text-1xl text-gray-600 font-bold whitespace-pre-line leading-relaxed border-l-4 border-gray-200 font-mono"> descripcion: </p>
          <p className="text-1xl text-gray-600 whitespace-pre-line leading-relaxed border-l-4 border-gray-200 font-mono"> {descripcionPlan} </p>
        </div>
      </div>

      {/* BOTÓN VOLVER (Posicionado abajo a la izquierda) */}
      <div className="ml-10 mb-5">
        <Link href="/frontend/cobros/pricing">
          <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Volver
          </button>
        </Link>
      </div>
    </div>
      

{/* DIV DE LA DERECHA  */}
      <div className="w-[40%] bg-white p-12 border-l">

        <h2 className="text-3xl text-gray-800 font-mono text-center mt-5">TOTAL A PAGAR</h2>
        
        <div className="text-4xl font-bold text-gray-800 px-6 py-2 text-center">
          ${totalAPagar.toFixed(2)}
        </div>

        <div className="flex justify-center items-center my-10">
          {qrUrl ? (
            <img 
              src={qrUrl} 
              alt="Código QR de Pago Real" 
              className="w-70 h-70 border-4 border-white shadow-2xl rounded-2xl transition-opacity duration-500" 
            />
          ) : (
            <div className="w-70 h-70 bg-gray-200 animate-pulse rounded-2xl flex items-center justify-center border-4 border-white shadow-2xl">
              <span className="text-gray-400 font-mono text-xs uppercase">Generando QR...</span>
            </div>
          )}
        </div>

          <div className="flex justify-center mt-19">
            <button 
              onClick={manejarVerificacion} 
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Verificar Pago
            </button>
          </div>
          <div className="flex justify-center mt-8">
            <button onClick={manejarDescarga} 
              className="bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded" >  
              Descargar QR
            </button>
          </div>

      </div>
      {/* modal   */}
      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#D9D9D9] p-10 w-[450px] text-center relative shadow-xl">
            {/* Botón X de cierre en la esquina */}
            <button 
              onClick={() => setMostrarModal(false)}
              className="absolute right-4 top-4 font-black text-xl text-gray-800"
            >
              X
            </button>

            <h2 className="text-xl font-black mb-4 text-[#1A233A] uppercase">
              {titulo}
            </h2>
            
            <p className="text-[#3E4D6E] text-sm mb-8 px-4 font-bold">
              {mensaje}
            </p>

            <Link href="/frontend/cobros/historial-pagos">
              <button
                className="bg-[#333] hover:bg-black text-white px-6 py-2 rounded text-xs font-bold"
              >
                Historial de Pagos
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}