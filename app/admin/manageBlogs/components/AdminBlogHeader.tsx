/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 09/05/2026
 * funcionalidad: renderiza la cabecera administrativa mostrando el autor, fechas y la insignia de estado
 */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { singleAdminBlogData } from "@/types/blogType";

export default function AdminBlogHeader({ ObjBlogBlo }: { ObjBlogBlo: singleAdminBlogData }) {
  const IntWordCountBlo = ObjBlogBlo.StrContentBlo?.split(/\s+/).length || 0;
  const IntReadTimeBlo = Math.max(1, Math.ceil(IntWordCountBlo / 200));

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-card-border pb-6 gap-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border border-border/50 bg-secondary-fund">
        {ObjBlogBlo.StrAuthorAvatarBlo && <AvatarImage src={ObjBlogBlo.StrAuthorAvatarBlo} alt={ObjBlogBlo.StrAuthorBlo} />}
        <AvatarFallback className="text-sm font-bold text-primary">
            {ObjBlogBlo.StrAuthorBlo.substring(0, 2).toUpperCase()}
            </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground text-base leading-none">
            {ObjBlogBlo.StrAuthorBlo}
          </span>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span>Creado el {ObjBlogBlo.StrCreationDateBlo}</span>
            <span className="text-border hidden sm:inline">•</span>
            <span>Publicado el {ObjBlogBlo.StrDateBlo}</span>
            <span className="text-border hidden sm:inline">•</span>
            <span>{IntReadTimeBlo} Min. de lectura</span>
          </div>
        </div>
      </div>
      
      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border-3 shadow-sm whitespace-nowrap ${
        ObjBlogBlo.BolIsDeletedBlo 
          ? 'bg-destructive/10 text-destructive border-destructive' 
          : ObjBlogBlo.StrStateBlo === 'PUBLICADO'
          ? 'bg-success/10 text-success border-success'
          : 'bg-warning/10 text-warning border-warning'
      }`}>
        {ObjBlogBlo.BolIsDeletedBlo ? "ELIMINADO LÓGICAMENTE" : ObjBlogBlo.StrStateBlo}
      </span>
    </header>
  );
}