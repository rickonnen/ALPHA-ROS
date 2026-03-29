// app/prueba/page.tsx
import { getPlanes } from '@/app/backend/controllers/cobros/planController'; // Ajusta la ruta si es necesario
export default async function PruebaPlanes() {
  // Aquí es donde ocurre la magia: llamamos a tu base de datos directo desde el servidor
  const planes = await getPlanes();

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Planes desdedesde Supabase:</h1>
      
      {/* Imprimimos el resultado crudo para ver qué nos responde Prisma */}
      <pre className="bg-slate-800 text-green-400 p-4 rounded-lg overflow-auto">
        {JSON.stringify(planes, null, 2)}
      </pre>
    </div>
  );
}