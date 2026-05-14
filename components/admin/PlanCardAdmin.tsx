import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface PlanCardAdminProps {
  nombre: string;
  precio: number;
  beneficio: string; // "X publicaciones" o "X días"
  tipo: "publicacion" | "promocion";
}

export function PlanCardAdmin({
  nombre,
  precio,
  beneficio,
  tipo,
}: PlanCardAdminProps) {
  return (
    <Card className="flex flex-col text-center border shadow-sm rounded-2xl pt-4 overflow-hidden bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-black uppercase">{nombre}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center px-6 pb-4">
        <span className="text-2xl font-black text-foreground">
          $ {precio.toLocaleString("es-ES")}
        </span>
        <div className="mt-2 text-muted-foreground text-sm font-medium">
          {beneficio}
        </div>
      </CardContent>
      <div className="flex border-t border-border mt-auto">
        <button className="flex-1 py-3 flex justify-center items-center gap-2 hover:bg-muted transition-colors border-r border-border text-sm font-bold">
          <Edit className="w-4 h-4" /> Editar
        </button>
        <button className="flex-1 py-3 flex justify-center items-center gap-2 hover:bg-destructive/10 text-destructive transition-colors text-sm font-bold">
          <Trash2 className="w-4 h-4" /> Eliminar
        </button>
      </div>
    </Card>
  );
}
