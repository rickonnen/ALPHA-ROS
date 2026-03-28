"use client"

import Link from 'next/link';
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PaymentDataTable } from "@/components/admin/PaymentDataTable"
import { PaymentRecord } from "@/components/admin/paymentTypes"

/**
 * Dev: René Gabriel Vera Portanda
 * Fecha: 24/03/26
 * Funcionalidad: Muestra la página de verificación de pagos con pestañas para pagos pendientes, aceptados y rechazados.
 * @return {object} objJSX - El componente React renderizado.
 */
export default function PaymentVerificationPage() {
  // Estados para almacenar los datos reales de la base de datos
  const [arrPending, setArrPending] = useState<PaymentRecord[]>([]);
  const [arrAccepted, setArrAccepted] = useState<PaymentRecord[]>([]);
  const [arrRejected, setArrRejected] = useState<PaymentRecord[]>([]);

  /**
   * Dev: René Gabriel Vera Portanda
   * Fecha: 24/03/26
   * Funcionalidad: Obtener los datos de pagos del backend y actualizar los arreglos de estado.
   * @return {object} objPromise - Promise que representa la finalización de las operaciones de obtención.
   */
  const loadPayments = async () => {
    try {
      const [objResPending, objResAccepted, objResRejected] = await Promise.all([
        fetch('/backend/historial-pagos?status=Pendiente'),
        fetch('/backend/cobros/historial-pagos?status=Aceptado'),
        fetch('/backend/cobros/historial-pagos?status=Rechazado')
      ]);

      const arrDataPending = await objResPending.json();
      const arrDataAccepted = await objResAccepted.json();
      const arrDataRejected = await objResRejected.json();

      /**
       * Dev: René Gabriel Vera Portanda
       * Fecha: 24/03/26
       * Funcionalidad: Formatea los datos sin procesar de la base de datos para que coincidan con los requisitos de la interfaz de usuario.
       * @param {array} arrDatabaseData - Array de datos sin procesar desde el backend.
       * @return {array} arrFormattedData - Array de registros de pago formateados.
       */
      const formatData = (arrDatabaseData: any[]): PaymentRecord[] => {
        return arrDatabaseData.map(objPayment => ({
          intId: objPayment.id_detalle,
          strClientName: objPayment.Usuario ? `${objPayment.Usuario.nombres} ${objPayment.Usuario.apellidos}` : 'Sin nombre',
          strPlanType: objPayment.PlanPublicacion?.nombre_plan || 'N/A',
          strDate: new Date(objPayment.fecha_detalle).toLocaleDateString(),
          strPaymentMethod: objPayment.metodo_pago,
          intStatus: objPayment.estado
        }));
      };

      setArrPending(formatData(arrDataPending));
      setArrAccepted(formatData(arrDataAccepted));
      setArrRejected(formatData(arrDataRejected));
    } catch (objError) {
      console.error("Error al cargar los pagos", objError);
    }
  };

  // Se ejecuta al cargar la página por primera vez
  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4EFE6] font-sans flex flex-col">
      <main className="flex-1 flex flex-col p-8 lg:px-16 lg:py-10">
        
        <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1F3A4D] text-center mb-10 tracking-tight">
          PANEL DE CONTROL
        </h1>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#E7E1D7] flex overflow-hidden min-h-[600px]">
          
          <aside className="w-64 border-r border-[#E7E1D7] flex flex-col p-6">
            <div className="space-y-2 mt-8 flex-1">
              <Button variant="ghost" className="w-full text-gray-400 justify-start hover:bg-gray-50">-</Button>
              <div className="border-b border-gray-100 my-2"></div>
              <Button variant="ghost" className="w-full text-gray-400 justify-start hover:bg-gray-50">-</Button>
              <div className="border-b border-gray-100 my-2"></div>
              <Button variant="secondary" className="w-full bg-gray-50 text-[#1F3A4D] font-bold justify-start hover:bg-gray-100">
                VERIFICACION DE PAGOS
              </Button>
              <div className="border-b border-gray-100 my-2"></div>
              <Button variant="ghost" className="w-full text-gray-400 justify-start hover:bg-gray-50">-</Button>
            </div>
            <Link href="/">
              <Button className="bg-[#333333] hover:bg-black text-white w-fit px-6 mt-auto">
                VOLVER
              </Button>
            </Link>
          </aside>

          <div className="flex-1 p-10 lg:p-14">
            <h2 className="text-4xl font-extrabold text-[#2E2E2E] mb-12 tracking-tight">
              VERIFICACION DE PAGOS
            </h2>

            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="bg-transparent h-auto p-0 space-x-1 mb-8">
                <TabsTrigger value="pending" className="px-6 py-2.5 bg-[#E7E1D7]/50 text-gray-600 font-semibold rounded-t-lg rounded-b-none data-[state=active]:bg-white data-[state=active]:text-[#1F3A4D] border border-transparent data-[state=active]:border-[#E7E1D7] data-[state=active]:border-b-white data-[state=active]:shadow-none relative z-10 translate-y-[1px]">
                  Pagos Pendientes
                </TabsTrigger>
                <TabsTrigger value="accepted" className="px-6 py-2.5 bg-[#E7E1D7]/50 text-gray-600 font-semibold rounded-t-lg rounded-b-none data-[state=active]:bg-white data-[state=active]:text-[#1F3A4D] border border-transparent data-[state=active]:border-[#E7E1D7] data-[state=active]:border-b-white data-[state=active]:shadow-none relative z-10 translate-y-[1px]">
                  Pagos Aceptados
                </TabsTrigger>
                <TabsTrigger value="rejected" className="px-6 py-2.5 bg-[#E7E1D7]/50 text-gray-600 font-semibold rounded-t-lg rounded-b-none data-[state=active]:bg-white data-[state=active]:text-[#1F3A4D] border border-transparent data-[state=active]:border-[#E7E1D7] data-[state=active]:border-b-white data-[state=active]:shadow-none relative z-10 translate-y-[1px]">
                  Pagos Rechazados
                </TabsTrigger>
              </TabsList>

              <div className="border-t border-[#E7E1D7] pt-8">
                <TabsContent value="pending" className="m-0 focus-visible:outline-none">
                  {/* Al aceptar/rechazar, recargamos las tablas */}
                  <PaymentDataTable 
                    arrData={arrPending} 
                    bolShowActions={true} 
                    onPaymentUpdated={loadPayments} 
                  />
                </TabsContent>
                <TabsContent value="accepted" className="m-0 focus-visible:outline-none">
                  <PaymentDataTable arrData={arrAccepted} bolShowActions={false} />
                </TabsContent>
                <TabsContent value="rejected" className="m-0 focus-visible:outline-none">
                  <PaymentDataTable arrData={arrRejected} bolShowActions={false} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}