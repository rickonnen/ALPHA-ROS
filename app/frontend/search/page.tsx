'use client';
import { useState } from 'react';
import PropertyCard, { Property } from '@/components/search/property-card';
import PriceDropdown from '@/components/search/priceDropdown';

export default function SearchPage() {
  // este es un estado para el mapa como ejemplo
  const [isMapOpen, setIsMapOpen] = useState(false);


  // prueba mockeado 
const PROPERTIES_MOCK: Property[] = [
  {
    id: 1,
    title: 'Propiedad de Alto Nivel en Venta Exclusiva',
    type: 'Casa en Venta',
    location: 'AV LAS AMERICAS, Sur, Santa Cruz',
    terrainArea: 1114,
    bedrooms: 4,
    bathrooms: 2,
    price: 1461925,
    currencySymbol: '$us',
    publishedDate: 'Publicado hace 5 días',
    whatsappContact: '59187654321',
    images: ['/casa1.jpg', '/casa2.jpg'] 
  },
  {
    id: 2,
    title: 'Propiedad de Alto Nivel en Venta Exclusiva',
    type: 'Casa en Venta',
    location: 'AV LAS AMERICAS, Sur, Santa Cruz',
    terrainArea: 1114,
    bedrooms: 4,
    bathrooms: 2,
    price: 1461925,
    currencySymbol: '$us',
    publishedDate: 'Publicado hace 5 días',
    whatsappContact: '59187654321',
    images: ['/casa2.jpg', '/casa3.jpg'] 
  },
  {
    id: 3,
    title: 'Propiedad de Alto Nivel en Venta Exclusiva',
    type: 'Casa en Venta',
    location: 'AV LAS AMERICAS, Sur, Santa Cruz',
    terrainArea: 1114,
    bedrooms: 4,
    bathrooms: 2,
    price: 1461925,
    currencySymbol: '$us',
    publishedDate: 'Publicado hace 5 días',
    whatsappContact: '59187654321',
    images: ['/casa3.jpg', '/casa1.jpg'] 
  }
];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* esta es la cabecera que va tener los filtros cuando sea movil, por ahora esta en oculto (hidden) */}
      <div className="flex md:hidden flex-wrap items-center justify-between gap-4 mb-6 border-b pb-4">
        {/* boton en movil para filtros, esto ustedes lo tiene que mejorar */}
        <button className="bg-[#E4C5A5] text-[#2C2C2C] px-6 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-[#d4b08c]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          Mostrar Filtros
        </button>
        <div className="flex items-center gap-2">
          {/* todo lo que esta dentro del label, ustedes lo quitan y van a poner el componente que crearon del mapa, por ahora esta este ejemplo para que se guien */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isMapOpen} onChange={() => setIsMapOpen(!isMapOpen)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a67c52]"></div>
          </label>
          {/* hasta aca */}
          <span className="text-sm font-medium text-gray-700">Mapa</span>
        </div>
      </div>
      {/* hasta aca seria la parte de movil */}

      {/* contenido en un grid de 12 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">        
        {/* sidebar de filtros en desktop  en tres columnas */}
        <aside className="hidden md:block md:col-span-3 space-y-6">
          <div className="sticky top-8">
            <h2 className="text-xl font-bold mb-4">Filtros</h2>
            {/* este es el espacio para boton del mapa */}
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isMapOpen} onChange={() => setIsMapOpen(!isMapOpen)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a67c52]"></div>
              </label>
              <span className="text-sm font-medium text-gray-700">Mapa</span>
            </div>
            {/* hasta aca el boton del mapa */}
            {/* dentro de este es espacio es para que pongan los componentes de filtro y esto se va a ver en el desktop */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-400">
              <PriceDropdown />
            </div>
            {/* hasta aca */}
          </div>
        </aside>
        {/* hasta aca fue lo de desktop */}

        {/* este es la parte principal donde va estar (directorio, cant resultados y ordenameinto) y las card */}
        <main className={`${isMapOpen ? 'md:col-span-5' : 'md:col-span-9'}`}>
          {/* esta es la cabecera en desktop */}
          <div className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            {/* esto es solo ejemplo, aca quitan y ponen su componente */}
            <div>
              <nav className="text-sm text-gray-500 mb-1">Casas y Casas en Condominio / Venta</nav>
              <h1 className="text-xl font-semibold">150 Casas y en Condominio en Venta en Bolivia</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-gray-600">Ordenar por:</span>
              <div className="border border-gray-300 px-3 py-2 rounded-md bg-white">Relevancia</div>
            </div>
          </div>
          {/* hasta caja es la cabecera en desktop */}

          {/* esto es movil y por ahora esta oculto*/}
          <div className="block md:hidden mb-4">
            {/* aca cambian por su compontente */}
            <nav className="text-sm text-gray-500 mb-1 underline">Casas y Casas en Condominio / Venta</nav>
            <h1 className="text-lg font-semibold mb-2">150 Casas y en Condominio en Venta en Bolivia</h1>
            <div className="border border-gray-300 px-3 py-2 rounded-md bg-white w-full text-center">Relevancia</div>
          </div>

          {/* esto es la parte logica para las cards, cuando sea movil 1 columna, desktop con mapa cerrado 2 columnas, desktop con mapa abierto 1 columna para que quepa en su espacio reducido */}
          {/* si tiene que editar algo para que funcione lo hacer nomas */}
          <div className={`grid grid-cols-1 ${isMapOpen ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-6`}>
              {PROPERTIES_MOCK.map((prop) => (<PropertyCard key={prop.id} property={prop} />))}
          </div>
        </main>

        {/*  estremo del mapa en movil  */}
        {isMapOpen && (
          <div className="fixed inset-x-0 bottom-0 top-[90px] z-40 bg-white md:relative md:inset-auto md:z-0 md:col-span-4 md:h-[calc(90vh-2rem)] md:sticky md:top-4 md:border-2 md:border-gray-200 md:rounded-xl">
            {/* este es el componente del mapa, aqui poner el componente */}
            <div className="w-full h-full bg-gray-100 relative rounded-xl overflow-hidden">
              {/* Aquí el componente de mapa ocupará todo el espacio disponible debajo de los botones */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                [Componente Mapa Activo]
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}