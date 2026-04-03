import { Suspense } from 'react';
import SearchPage from '@/app/search/page';

export default function BusquedaPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SearchPage />
    </Suspense>
  );
}