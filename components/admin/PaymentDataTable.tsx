"use client"
import { PaymentAcceptModal } from "./PaymentAcceptModal"
import { PaymentRejectModal } from "./PaymentRejectModal"
import { usePaymentActions } from "./usePaymentActions";
import { PaymentDesktopTable } from "./PaymentDesktopTable";
import { PaymentMobileCards } from "./PaymentMobileCards";
import { PaymentPagination } from "./PaymentPagination";
import { PaymentRecord } from "./paymentTypes"

interface PaymentDataTableProps {
  arrData: PaymentRecord[];
  bolShowActions?: boolean;
  onPaymentUpdated?: () => void;
  bolIsLoading?: boolean;
  intCurrentPage?: number;
  intTotalPages?: number;
  onPageChange?: (intPage: number) => void;
  onViewReceipt?: (strUrl: string) => void;
  strStatus: 'Pendiente' | 'Aceptado' | 'Rechazado';
}

export function PaymentDataTable(props: PaymentDataTableProps) {
  const {
    bolIsProcessing,
    bolShowAcceptModal,
    setBolShowAcceptModal,
    bolShowRejectModal,
    setBolShowRejectModal,
    objSelectedPayment,
    handleOpenModal,
    updatePaymentStatus
  } = usePaymentActions(props.onPaymentUpdated);

  return (
    <div className="w-full bg-transparent">
      <PaymentMobileCards {...props} onOpenModal={handleOpenModal} bolIsProcessing={bolIsProcessing} />
      
      <PaymentDesktopTable {...props} onOpenModal={handleOpenModal} bolIsProcessing={bolIsProcessing} />

      <PaymentPagination 
        intCurrentPage={props.intCurrentPage || 1} 
        intTotalPages={props.intTotalPages || 1} 
        bolIsLoading={props.bolIsLoading}
        onPageChange={props.onPageChange}
      />

      {/* Modales de Decisión */}
      {objSelectedPayment && (
        <>
          <PaymentAcceptModal 
            bolIsOpen={bolShowAcceptModal}
            onOpenChange={setBolShowAcceptModal}
            strClientName={objSelectedPayment.strClientName}
            strPlanName={objSelectedPayment.strPlanType}
            onConfirm={() => updatePaymentStatus('Aceptado')}
          />
          <PaymentRejectModal 
            bolIsOpen={bolShowRejectModal}
            onOpenChange={setBolShowRejectModal}
            strClientName={objSelectedPayment.strClientName}
            strPlanName={objSelectedPayment.strPlanType}
            onConfirm={(reason) => updatePaymentStatus('Rechazado', reason)}
          />
        </>
      )}
    </div>
  );
}