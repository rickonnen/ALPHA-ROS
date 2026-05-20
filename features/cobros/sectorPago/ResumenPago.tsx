import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  titulo: string;
  descripcion: string;
  detalles: string[];
  monto: number;
  backUrl: string;
  tipoPago: "qr" | "virtual";
  tipoPlan: number | null; 
  resumenPublicacionNode?: React.ReactNode; 
}
interface PasoItemProps {
  num: number;
  titulo: string;
  descripcion: React.ReactNode; // ReactNode para permitir <span> dentro
  esUltimo?: boolean;
}

const PASOS_QR = (monto: number) => [
  {
    titulo: "Escanea el código QR",
    descripcion: (
      <>
        Abre la aplicación de tu banco y escanea el código QR que aparece a la derecha. Asegúrate de ingresar el monto exacto:{" "}
        <span className="font-semibold text-foreground">${monto.toLocaleString("es-ES")}</span>.
      </>
    ),
  },
  {
    titulo: "Guarda el comprobante",
    descripcion:
      "Una vez realizada la transferencia, guarda la imagen o captura de pantalla del comprobante en tu dispositivo.",
  },
  {
    titulo: "Sube y verifica",
    descripcion: (
      <>
        Haz clic en <span className="italic text-foreground">"Adjuntar comprobante"</span>, selecciona tu imagen y luego
        presiona <span className="italic text-foreground">"Verificar Pago"</span>.
      </>
    ),
  },
];

const PASOS_VIRTUAL = [
  {
    titulo: "Verifica el monto en TRX",
    descripcion: (
      <>
        El sistema convierte automáticamente el valor de tu plan al equivalente exacto en{" "}
        <span className="font-semibold text-foreground">TRON (TRX)</span> usando la tasa actual.
      </>
    ),
  },
  {
    titulo: "Envía el pago",
    descripcion:
      "Envía el monto exacto a la dirección de la billetera indicada a la derecha. Puedes escanear el QR desde tu Wallet.",
  },
  {
    titulo: "Espera la confirmación",
    descripcion: (
      <>
        Una vez que se confirme la transacción, tu plan se activará{" "}
        <span className="font-semibold text-foreground">automáticamente</span>.
      </>
    ),
  },
];


const PasoItem = ({ num, titulo, descripcion, esUltimo = false }: PasoItemProps) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
        {num}
      </div>
      {!esUltimo && <div className="w-px flex-grow bg-border mt-2" />}
    </div>

    <div className={esUltimo ? "" : "pb-4"}>
      <h3 className="font-bold text-foreground">{titulo}</h3>
      <p className="text-sm text-muted-foreground">{descripcion}</p>
    </div>
  </div>
);

export const ResumenPago = ({ titulo, descripcion, detalles, monto, backUrl, tipoPago, resumenPublicacionNode }: Props) => {
const pasos = tipoPago === "qr" ? PASOS_QR(monto) : PASOS_VIRTUAL;
  return (
    <div className="flex flex-col w-full h-full mt-6 bg-muted/30 p-6 md:p-8 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col">
        
        <div className="md:hidden mb-6">
          <Link href={backUrl} className="w-fit block">
            <Button variant="default" className="font-bold uppercase text-xs">
              Volver
            </Button>
          </Link>
        </div>
        
        {/* Título Dinámico */}
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl uppercase text-foreground">
          {titulo}
        </h1>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
            Resumen de suscripción
          </h2>
          
          {/* Descripción Dinámica */}
          <p className="text-muted-foreground leading-relaxed">
            {descripcion}
          </p>

          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">
              Detalles del plan
            </h3>
            <ul className="space-y-3">
              {detalles.map((item, i) => (
                <li key={i} className="flex items-center text-foreground font-medium">
                  <div className="mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {resumenPublicacionNode && (
          <div className="mt-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            {resumenPublicacionNode}
          </div>
        )}

        <section className="mt-8 space-y-6">
          <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
            PASOS
          </h2>
           <div key={tipoPago} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {pasos.map((paso, i) => (
              <PasoItem
                key={i}
                num={i + 1}
                titulo={paso.titulo}
                descripcion={paso.descripcion}
                esUltimo={i === pasos.length - 1}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="flex-grow" />

      <div className="hidden md:block mt-10">
        <Link href={backUrl} className="w-fit block">
          <Button variant="default" className="font-bold uppercase flex items-center transition-all duration-300 cursor-pointer hover:bg-primary/80">
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Button>
        </Link>
      </div>
    </div>
  );
};
