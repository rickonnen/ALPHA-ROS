import { useState } from "react";
import { PaymentRecord } from "./paymentTypes";

export function usePaymentActions(onPaymentUpdated?: () => void) {
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