"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentDataTable } from "@/components/admin/PaymentDataTable"
import { PaymentRecord } from "@/components/admin/paymentTypes"
import { AccessDenied } from "@/components/admin/AccessDenied" 

/**
 * Dev: René Gabriel Vera Portanda
 * Fecha: 29/03/26
 * Funcionalidad: Muestra la página de verificación de pagos con soporte para paginación dinámica y validación de seguridad (403).
 */
export default function PaymentVerificationPage() {
  const [arrPending, setArrPending] = useState<PaymentRecord[]>([]);
  const [arrAccepted, setArrAccepted] = useState<PaymentRecord[]>([]);
  const [arrRejected, setArrRejected] = useState<PaymentRecord[]>([]);
  const [bolIsLoading, setBolIsLoading] = useState<boolean>(true);

  // CONTROL DE SEGURIDAD 
  const [bolIsAuthorized, setBolIsAuthorized] = useState<boolean>(true);

  // ESTADOS DE PAGINACIÓN 
  const [intPagePending, setIntPagePending] = useState<number>(1);
  const [intTotalPagesPending, setIntTotalPagesPending] = useState<number>(1);

  const [intPageAccepted, setIntPageAccepted] = useState<number>(1);
  const [intTotalPagesAccepted, setIntTotalPagesAccepted] = useState<number>(1);

  const [intPageRejected, setIntPageRejected] = useState<number>(1);
  const [intTotalPagesRejected, setIntTotalPagesRejected] = useState<number>(1);

  /**
   * Funcionalidad: Carga los pagos usando los estados de página actuales y valida permisos.
   */
  const loadPayments = async () => {
    setBolIsLoading(true);
    try {
      const [objResPending, objResAccepted, objResRejected] = await Promise.all([
        fetch(`/backend/cobros/verificacion-pagos?status=Pendiente&page=${intPagePending}&limit=10`),
        fetch(`/backend/cobros/verificacion-pagos?status=Aceptado&page=${intPageAccepted}&limit=10`), 
        fetch(`/backend/cobros/verificacion-pagos?status=Rechazado&page=${intPageRejected}&limit=10`)
      ]);

      // Si el backend Rechaza (403), bloquea la vista 
      if (
        objResPending.status === 403 || 
        objResAccepted.status === 403 || 
        objResRejected.status === 403
      ) {
        setBolIsAuthorized(false);
        return; // Detiene la ejecución aquí, no intenta mapear datos vacíos
      }

      // Si pasa el escudo, confirmamos que esta autorizado
      setBolIsAuthorized(true);

      const objDataPending = await objResPending.json();
      const objDataAccepted = await objResAccepted.json();
      const objDataRejected = await objResRejected.json();

      const formatData = (arrDatabaseData: any[]): PaymentRecord[] => {
        if (!arrDatabaseData || !Array.isArray(arrDatabaseData)) return [];
        return arrDatabaseData.map(objPayment => ({
          intId: objPayment.id_detalle,
          strClientName: objPayment.Usuario 
            ? `${objPayment.Usuario.nombres} ${objPayment.Usuario.apellidos}` 
            : 'Sin nombre',
          strPlanType: objPayment.PlanPublicacion?.nombre_plan || 'N/A',
          strDate: objPayment.fecha_detalle 
            ? new Date(objPayment.fecha_detalle).toLocaleDateString('es-BO') 
            : 'Sin fecha',
          strPaymentMethod: objPayment.metodo_pago || 'No especificado',
          intStatus: objPayment.estado
        }));
      };

      // Guarda los datos formateados
      setArrPending(formatData(objDataPending.arrPayments));
      setArrAccepted(formatData(objDataAccepted.arrPayments));
      setArrRejected(formatData(objDataRejected.arrPayments));

      // Guarda el total de páginas que calculó el servidor
      setIntTotalPagesPending(objDataPending.intTotalPages || 1);
      setIntTotalPagesAccepted(objDataAccepted.intTotalPages || 1);
      setIntTotalPagesRejected(objDataRejected.intTotalPages || 1);

    } catch (objError) {
      console.error("Error al cargar los pagos:", objError);
    } finally {
      setBolIsLoading(false);
    }
  };

  // Se ejecuta al montar y cada vez que una página cambie
  useEffect(() => {
    loadPayments();
  }, [intPagePending, intPageAccepted, intPageRejected]);

  return (
    <div className="flex-1 p-10 lg:p-14 bg-background">
      <h2 className="text-4xl font-extrabold text-foreground mb-12 tracking-tight">
        VERIFICACION DE PAGOS
      </h2>

      {/* --- RENDERIZADO CONDICIONAL --- */}
      {!bolIsAuthorized ? (
        <AccessDenied />
      ) : (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="bg-transparent h-auto p-0 space-x-1 mb-8">
            <TabsTrigger value="pending" className="px-6 py-2.5 bg-muted/50 text-muted-foreground font-semibold rounded-t-lg rounded-b-none data-[state=active]:bg-card data-[state=active]:text-primary border border-transparent data-[state=active]:border-border data-[state=active]:border-b-transparent relative z-10 translate-y-[1px] transition-all">
              Pagos Pendientes
            </TabsTrigger>
            <TabsTrigger value="accepted" className="px-6 py-2.5 bg-muted/50 text-muted-foreground font-semibold rounded-t-lg rounded-b-none data-[state=active]:bg-card data-[state=active]:text-primary border border-transparent data-[state=active]:border-border data-[state=active]:border-b-transparent relative z-10 translate-y-[1px] transition-all">
              Pagos Aceptados
            </TabsTrigger>
            <TabsTrigger value="rejected" className="px-6 py-2.5 bg-muted/50 text-muted-foreground font-semibold rounded-t-lg rounded-b-none data-[state=active]:bg-card data-[state=active]:text-primary border border-transparent data-[state=active]:border-border data-[state=active]:border-b-transparent relative z-10 translate-y-[1px] transition-all">
              Pagos Rechazados
            </TabsTrigger>
          </TabsList>

          <div className="border-t border-border pt-8">
            <TabsContent value="pending" className="m-0 focus-visible:outline-none">
              <PaymentDataTable 
                arrData={arrPending} 
                bolShowActions={true} 
                onPaymentUpdated={loadPayments} 
                bolIsLoading={bolIsLoading}
                intCurrentPage={intPagePending}
                intTotalPages={intTotalPagesPending}
                onPageChange={(intNewPage) => setIntPagePending(intNewPage)}
              />
            </TabsContent>
            <TabsContent value="accepted" className="m-0 focus-visible:outline-none">
              <PaymentDataTable 
                arrData={arrAccepted} 
                bolShowActions={false} 
                bolIsLoading={bolIsLoading}
                intCurrentPage={intPageAccepted}
                intTotalPages={intTotalPagesAccepted}
                onPageChange={(intNewPage) => setIntPageAccepted(intNewPage)}
              />
            </TabsContent>
            <TabsContent value="rejected" className="m-0 focus-visible:outline-none">
              <PaymentDataTable 
                arrData={arrRejected} 
                bolShowActions={false} 
                bolIsLoading={bolIsLoading}
                intCurrentPage={intPageRejected}
                intTotalPages={intTotalPagesRejected}
                onPageChange={(intNewPage) => setIntPageRejected(intNewPage)}
              />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  )
}