/**Archivo: confirmModal.tsx
 * Direccion: alpha-ros-deploy1\app\perfil\views\redes-vinculadas>
 */
import { useEffect } from "react"
 
type ConfirmModalProps = {
  icon?: React.ReactNode
  iconBg?: string
  title: string
  description: string
  confirmText: string
  confirmDark?: boolean
  cancelText?: string
  autoDismissSeconds?: number
  onConfirm: () => void
  onCancel?: () => void
}
 
const DefaultIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path fill="none" d="m18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07a5.006 5.006 0 0 0-6.95 0l-1.72 1.71m-6.58 6.57l-1.71 1.71a5.004 5.004 0 0 0 .12 7.07a5.006 5.006 0 0 0 6.95 0l1.71-1.71M8 2v3M2 8h3m11 11v3m3-6h3"/>
  </svg>
)
 
export default function ConfirmModal({
  icon,
  iconBg = "bg-red-50",
  title,
  description,
  confirmText,
  confirmDark = false,
  cancelText,
  autoDismissSeconds,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
 
  useEffect(() => {
    if (!autoDismissSeconds) return
    const timer = setTimeout(() => {
      onConfirm()
    }, autoDismissSeconds * 1000)
    return () => clearTimeout(timer)
  }, [autoDismissSeconds, onConfirm])
 
  const confirmBtnStyle = confirmDark
    ? { backgroundColor: "#1F3A4D" }
    : { backgroundColor: "#EF4444" }
 
  const confirmBtnClass = confirmDark
    ? `px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors ${cancelText ? "flex-1" : "w-full"}`
    : `px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-md shadow-red-200 transition-colors ${cancelText ? "flex-1" : "w-full"}`
 
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center animate-in zoom-in-95 duration-200">
 
        <div className={`${iconBg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
          {icon ?? <DefaultIcon />}
        </div>
 
        <h3 className="text-lg font-bold mb-2 text-slate-800 uppercase tracking-tight">
          {title}
        </h3>
 
        <p className="text-slate-500 text-sm mb-6">{description}</p>
 
        {autoDismissSeconds && (
          <p className="text-xs text-slate-400 mb-4">
            Se cerrara automaticamente en {autoDismissSeconds} segundos
          </p>
        )}
 
        <div className={`flex gap-3 ${!cancelText ? "justify-center" : ""}`}>
          {cancelText && onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            style={confirmBtnStyle}
            className={confirmBtnClass}
          >
            {confirmText}
          </button>
        </div>
 
      </div>
    </div>
  )
}