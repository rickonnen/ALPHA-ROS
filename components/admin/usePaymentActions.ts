import { useState } from "react";
import { PaymentRecord } from "./paymentTypes";
import { useAuth } from "@/app/auth/AuthContext";

export function usePaymentActions(onPaymentUpdated?: () => void) {
  const { user } = useAuth();
  const [bolShowAcceptModal, setBolShowAcceptModal] = useState<boolean>(false);
  const [bolShowRejectModal, setBolShowRejectModal] = useState<boolean>(false);
  const [objSelectedPayment, setObjSelectedPayment] = useState<PaymentRecord | null>(null);
  const [bolIsProcessing, setBolIsProcessing] = useState<boolean>(false);

  const handleOpenModal = (objPayment: PaymentRecord, type: 'accept' | 'reject') => {
    setObjSelectedPayment(objPayment);
    if (type === 'accept') setBolShowAcceptModal(true);
    else setBolShowRejectModal(true);
  };

  const updatePaymentStatus = async (strNewStatus: 'Aceptado' | 'Rechazado', strReason?: string) => {
    if (!objSelectedPayment || bolIsProcessing) return;
    
    setBolIsProcessing(true);
    try {
      const objResponse = await fetch('/api/cobros/verificacion-pagos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: objSelectedPayment.intId,
          status: strNewStatus,
          reason: strReason || null
        }),
      });

      if (objResponse.ok) {
        try {
          await fetch('/api/admin/envioNotificacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id_detalle: objSelectedPayment.intId,
              decision: strNewStatus === 'Aceptado' ? 'ACEPTAR' : 'RECHAZAR',
              motivo_rechazo: strReason || null,
              id_admin_ejecutor: user?.id
            }),
          });
        } catch (errorNotif) {
          console.error("Error al enviar la notificación:", errorNotif);
        }
        setBolShowAcceptModal(false);
        setBolShowRejectModal(false);
        if (onPaymentUpdated) onPaymentUpdated();
      } else {
        alert(`Error al intentar marcar el pago como ${strNewStatus.toLowerCase()}`);
      }
    } catch (objError) {
      console.error("Error de conexión:", objError);
      alert("Error de red. Por favor, revisa tu conexión.");
    } finally {
      setBolIsProcessing(false);
    }
  };

  return {
    bolIsProcessing,
    bolShowAcceptModal,
    setBolShowAcceptModal,
    bolShowRejectModal,
    setBolShowRejectModal,
    objSelectedPayment,
    handleOpenModal,
    updatePaymentStatus
  };
}