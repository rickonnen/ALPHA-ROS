"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentDataTable } from "@/components/admin/PaymentDataTable"
import { PaymentRecord } from "@/components/admin/paymentTypes"
import { AccessDenied } from "@/components/admin/AccessDenied"

/**
 * Dev: René Gabriel Vera Portanda
 * Fecha: 29/03/26
 * Funcionalidad: Muestra la página de verificación de pagos optimizada.
 */
export default function PaymentVerificationPage() {
  const [paymentsData, setPaymentsData] = useState({
    pending: { data: [] as PaymentRecord[], page: 1, totalPages: 1 },
    accepted: { data: [] as PaymentRecord[], page: 1, totalPages: 1 },
    rejected: { data: [] as PaymentRecord[], page: 1, totalPages: 1 },
  });

  const [bolIsLoading, setBolIsLoading] = useState<boolean>(true);
  const [bolIsAuthorized, setBolIsAuthorized] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const formatData = useCallback((arrDatabaseData: any[]): PaymentRecord[] => {

    if (!arrDatabaseData || !Array.isArray(arrDatabaseData)) return [];
    return arrDatabaseData.map(objPayment => ({
      intId: objPayment.id_detalle,
      strClientName: objPayment.Usuario 
        ? `${objPayment.Usuario.nombres} ${objPayment.Usuario.apellidos ?? ""}`.trim() 
        : 'Sin nombre',
      strPlanType: objPayment.PlanPublicacion?.nombre_plan || 'N/A',
      strDate: objPayment.fecha_detalle 
  ? new Date(objPayment.fecha_detalle).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false 
    }) 
  : 'Sin fecha',
      strPaymentMethod: objPayment.metodo_pago || 'No especificado',
      intStatus: objPayment.estado
    }));
  }, []);

  /**
   * Fetch independiente por estado. 
   */
  const fetchStatus = useCallback(async (status: 'Pendiente' | 'Aceptado' | 'Rechazado', page: number) => {
    const key = status === 'Pendiente' ? 'pending' : status === 'Aceptado' ? 'accepted' : 'rejected';
    
    try {
      const res = await fetch(`/api/cobros/verificacion-pagos?status=${status}&page=${page}&limit=10`);
      
      if (res.status === 403) {
        setBolIsAuthorized(false);
        return;
      }

      const json = await res.json();
      
      setPaymentsData(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          data: formatData(json.arrPayments || []),
          totalPages: json.intTotalPages || 1,
          page: page 
        }
      }));
    } catch (error) {
      console.error(`Error cargando pagos ${status}:`, error);
    }
  }, [formatData]);

  // Carga inicial: Descarga las 3 pestañas solo la primera vez
  useEffect(() => {
    setBolIsLoading(true);
    Promise.all([
      fetchStatus('Pendiente', 1),
      fetchStatus('Aceptado', 1),
      fetchStatus('Rechazado', 1)
    ]).finally(() => setBolIsLoading(false));
  }, [fetchStatus]);

  /**
   * Controlador de paginación.
   */
  const handlePageChange = async (status: 'Pendiente' | 'Aceptado' | 'Rechazado', newPage: number) => {
    setBolIsLoading(true); 
    await fetchStatus(status, newPage);
    setBolIsLoading(false); 
  };

  // Función general para recargar todo
  const handlePaymentUpdated = () => {
    setBolIsLoading(true);
    Promise.all([
      fetchStatus('Pendiente', paymentsData.pending.page),
      fetchStatus('Aceptado', paymentsData.accepted.page),
      fetchStatus('Rechazado', paymentsData.rejected.page)
    ]).finally(() => setBolIsLoading(false));
  };

  return (
    <div className="flex-1 p-4 sm:p-10 lg:p-14 bg-background">
      <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-8 sm:mb-12 tracking-tight">
        VERIFICACION DE PAGOS
      </h2>

      {!bolIsAuthorized ? (
        <AccessDenied />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          {/* VERSIÓN MÓVIL */}
          <div className="sm:hidden mb-6 relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-card border border-border text-foreground text-sm font-semibold rounded-lg p-3.5 shadow-sm flex justify-between items-center outline-none focus:ring-2 focus:ring-primary"
            >
              {/* Muestra el nombre de la pestaña activa */}
              {activeTab === 'pending' ? 'Pagos Pendientes' : activeTab === 'accepted' ? 'Pagos Aceptados' : 'Pagos Rechazados'}
              
              {/* Icono de flecha */}
              <svg 
                className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {/* Opciones del menú  */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => { setActiveTab('pending'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50 ${activeTab === 'pending' ? 'text-primary bg-muted/20' : 'text-muted-foreground'}`}
                >
                  Pagos Pendientes
                </button>
                <div className="border-b border-border/50"></div>
                <button
                  onClick={() => { setActiveTab('accepted'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50 ${activeTab === 'accepted' ? 'text-primary bg-muted/20' : 'text-muted-foreground'}`}
                >
                  Pagos Aceptados
                </button>
                <div className="border-b border-border/50"></div>
                <button
                  onClick={() => { setActiveTab('rejected'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50 ${activeTab === 'rejected' ? 'text-primary bg-muted/20' : 'text-muted-foreground'}`}
                >
                  Pagos Rechazados
                </button>
              </div>
            )}
          </div>

          {/* VERSIÓN ESCRITORIO: Pestañas normales */}
          <TabsList className="hidden sm:flex bg-transparent h-auto p-0 space-x-1 mb-8">
            <TabsTrigger value="pending" className="px-6 py-2.5 bg-muted/50 text-muted-foreground font-semibold rounded-t-lg rounded-b-none data-[state=active]:bg-card data-[state=active]:text-primary border border-transparent data-[state=active]:border-border data-[state=active]:border-b-transparent relative z-10 translate-y-px transition-all">
              Pagos Pendientes
            </TabsTrigger>
            <TabsTrigger value="accepted" className="px-6 py-2.5 bg-muted/50 text-muted-foreground font-semibold rounded-t-lg rounded-b-none data-[state=active]:bg-card data-[state=active]:text-primary border border-transparent data-[state=active]:border-border data-[state=active]:border-b-transparent relative z-10 translate-y-px transition-all">
              Pagos Aceptados
            </TabsTrigger>
            <TabsTrigger value="rejected" className="px-6 py-2.5 bg-muted/50 text-muted-foreground font-semibold rounded-t-lg rounded-b-none data-[state=active]:bg-card data-[state=active]:text-primary border border-transparent data-[state=active]:border-border data-[state=active]:border-b-transparent relative z-10 translate-y-px transition-all">
              Pagos Rechazados
            </TabsTrigger>
          </TabsList>

          <div className="border-t border-border pt-6 sm:pt-8">
            <TabsContent value="pending" className="m-0 focus-visible:outline-none">
              <PaymentDataTable 
                arrData={paymentsData.pending.data} 
                bolShowActions={true} 
                onPaymentUpdated={handlePaymentUpdated} 
                bolIsLoading={bolIsLoading}
                intCurrentPage={paymentsData.pending.page}
                intTotalPages={paymentsData.pending.totalPages}
                onPageChange={(intNewPage) => handlePageChange('Pendiente', intNewPage)}
              />
            </TabsContent>
            <TabsContent value="accepted" className="m-0 focus-visible:outline-none">
              <PaymentDataTable 
                arrData={paymentsData.accepted.data} 
                bolShowActions={false} 
                bolIsLoading={bolIsLoading}
                intCurrentPage={paymentsData.accepted.page}
                intTotalPages={paymentsData.accepted.totalPages}
                onPageChange={(intNewPage) => handlePageChange('Aceptado', intNewPage)}
              />
            </TabsContent>
            <TabsContent value="rejected" className="m-0 focus-visible:outline-none">
              <PaymentDataTable 
                arrData={paymentsData.rejected.data} 
                bolShowActions={false} 
                bolIsLoading={bolIsLoading}
                intCurrentPage={paymentsData.rejected.page}
                intTotalPages={paymentsData.rejected.totalPages}
                onPageChange={(intNewPage) => handlePageChange('Rechazado', intNewPage)}
              />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  )
}