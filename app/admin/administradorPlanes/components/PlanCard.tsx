import { Edit3 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Plan } from "../page"; // Importamos la interfaz del page principal

interface PlanCardProps {
  plan: Plan;
  labelDinamica: string;
  onEdit: (plan: Plan) => void;
}

export default function PlanCard({ plan, labelDinamica, onEdit }: PlanCardProps) {
  return (
    <div className="relative flex flex-col text-center border-2 border-transparent shadow-sm rounded-[2rem] pt-10 overflow-hidden bg-card hover:border-primary/20 hover:shadow-xl transition-all group">
      <div className="absolute top-6 right-6 flex flex-col items-center gap-2">
        <span className="text-[9px] font-black uppercase opacity-20 tracking-tighter">
          {plan.activo ? "Activo" : "Inactivo"}
        </span>
        <Switch
          checked={plan.activo}
          onCheckedChange={() => {
            // Aquí irá tu lógica de toggle más adelante
            console.log("Toggle plan", plan.id_plan);
          }}
        />
      </div>
      
      <div className="px-8 pb-3">
        <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
          {plan.nombre_plan}
        </h3>
      </div>
      
      <div className="flex flex-col items-center px-8 pb-10">
        <span className="text-5xl font-black tracking-tighter">
          $ {plan.precio_plan}
        </span>
        <div className="mt-6 text-muted-foreground text-[10px] font-black uppercase tracking-[0.25em] bg-muted/50 px-5 py-2 rounded-full border">
          {plan.cant_publicaciones} {labelDinamica}
        </div>
      </div>
      
      <button
        onClick={() => onEdit(plan)}
        className="w-full py-6 border-t bg-muted/5 flex justify-center items-center gap-3 hover:bg-primary hover:text-white transition-all text-xs font-black uppercase tracking-widest"
      >
        <Edit3 className="w-4 h-4" /> Editar Plan
      </button>
    </div>
  );
}