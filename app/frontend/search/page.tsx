import { SortSelect } from "./componentes/SortSelect"

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Tu componente de ordenamiento */}
      <SortSelect />
      
      {/* Espacio  */}
      <div className="p-10 text-center text-gray-300 italic border-t border-dashed mt-4">
        Lista de inmuebles (Próximamente)
        <br />
        <span className="text-blue-500 font-bold text-xs uppercase">
          ¡Componente de Alexander funcionando! ✅
        </span>
      </div>
    </main>
  )
}