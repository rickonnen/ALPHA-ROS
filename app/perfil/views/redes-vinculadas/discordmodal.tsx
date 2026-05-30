/*discordmodal.tsx*/
import ConfirmModal from "@/app/perfil/views/redes-vinculadas/confirmModal"
 
// ── Iconos
 
const IconCadenaVerde = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M16.6666 21.6669C17.3824 22.6238 18.2956 23.4156 19.3442 23.9885C20.3929 24.5614 21.5525 24.9021 22.7444 24.9875C23.9363 25.0729 25.1326 24.9009 26.2522 24.4832C27.3718 24.0656 28.3885 23.4121 29.2333 22.5669L34.2333 17.5669C35.7513 15.9952 36.5912 13.8902 36.5722 11.7053C36.5533 9.52028 35.6769 7.43018 34.1318 5.88511C32.5867 4.34005 30.4966 3.46364 28.3116 3.44465C26.1267 3.42566 24.0216 4.26562 22.45 5.7836L19.5833 8.6336" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23.3333 18.3331C22.6175 17.3762 21.7044 16.5844 20.6557 16.0115C19.6071 15.4386 18.4475 15.0979 17.2555 15.0125C16.0636 14.9271 14.8673 15.0991 13.7477 15.5168C12.6281 15.9344 11.6114 16.5879 10.7666 17.4331L5.76663 22.4331C4.24865 24.0047 3.4087 26.1098 3.42768 28.2947C3.44667 30.4797 4.32308 32.5698 5.86815 34.1149C7.41321 35.6599 9.50332 36.5364 11.6883 36.5553C13.8733 36.5743 15.9783 35.7344 17.55 34.2164L20.4 31.3664" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
 
const IconCheckVerde = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="31" viewBox="0 0 40 31" fill="none">
    <path d="M1.75 15.75L14.75 28.75L37.75 1.75" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
 
const IconCadenaRota = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="43" viewBox="0 0 48 43" fill="none">
    <path d="M18 30.4587H14C11.3478 30.4587 8.8043 29.5148 6.92893 27.8348C5.05357 26.1548 4 23.8762 4 21.5003C4 19.1244 5.05357 16.8458 6.92893 15.1658C8.8043 13.4858 11.3478 12.542 14 12.542" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30 12.542H34C35.8571 12.542 37.6776 13.0053 39.2573 13.8799C40.8371 14.7546 42.1137 16.006 42.9443 17.494C43.7748 18.9821 44.1264 20.6479 43.9596 22.3048C43.7928 23.9618 43.1143 25.5444 42 26.8753" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 21.5H24" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 3.58301L44 39.4163" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
 
const IconXRoja = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
    <path d="M36.75 12L12.25 36" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.25 12L36.75 36" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
 
// ── Tipos 
 
type BaseProps = {
  onClose: () => void
}
 
type ConfirmProps = BaseProps & {
  onConfirm: () => void
}
 
// ── Modales 
 
export function DiscordConfirmVincular({ onClose, onConfirm }: ConfirmProps) {
  return (
    <ConfirmModal
      icon={<IconCadenaVerde />}
      iconBg="bg-green-50"
      title="PROPBOL QUIERE UTILIZAR DISCORD PARA VINCULAR TU CUENTA"
      description="Esto le permite a la app y al sitio compartir informacion acerca de ti."
      confirmText="Continuar"
      confirmDark
      cancelText="Cancelar"
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  )
}
 
export function DiscordSuccessVincular({ onClose }: BaseProps) {
  return (
    <ConfirmModal
      icon={<IconCheckVerde />}
      iconBg="bg-green-50"
      title="Discord vinculado correctamente!"
      description="Discord se vinculo exitosamente a tu cuenta. A partir de ahora podras iniciar sesion de forma rapida y segura."
      confirmText="Aceptar"
      confirmDark
      autoDismissSeconds={7}
      onConfirm={onClose}
    />
  )
}
 
export function DiscordConfirmDesvincular({ onClose, onConfirm }: ConfirmProps) {
  return (
    <ConfirmModal
      icon={<IconCadenaRota />}
      iconBg="bg-red-50"
      title="DESVINCULAR DISCORD?"
      description="Si desvincula tu cuenta, perderas el acceso rapido mediante Discord. Deseas continuar?"
      confirmText="Si, Desvincular"
      cancelText="Cancelar"
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  )
}
 
export function DiscordSuccessDesvincular({ onClose }: BaseProps) {
  return (
    <ConfirmModal
      icon={<IconCadenaRota />}
      iconBg="bg-red-50"
      title="Discord desvinculado!"
      description="Tu cuenta de Discord ha sido desvinculada. Ya no podras iniciar sesion a traves de Discord."
      confirmText="Aceptar"
      confirmDark
      autoDismissSeconds={7}
      onConfirm={onClose}
    />
  )
}
 
export function DiscordError({ onClose }: BaseProps) {
  return (
    <ConfirmModal
      icon={<IconXRoja />}
      iconBg="bg-red-50"
      title="Ocurrio un error!"
      description="No pudimos vincular tu cuenta. Por favor, intentalo de nuevo."
      confirmText="Aceptar"
      confirmDark
      autoDismissSeconds={15}
      onConfirm={onClose}
    />
  )
}