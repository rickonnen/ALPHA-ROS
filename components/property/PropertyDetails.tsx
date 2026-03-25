/** * Dev: Marcela C.
 * Date: 24/03/2026
 * Funcionalidad: Technical details grid with color tags and no icons.
 */
import React from 'react';

interface PropertyDetailsProps {
  objInfo: {
    strType: string; strOperation: string; strDept: string; strZone: string;
    intRooms: number; intBaths: number; intFloors: number; intGarages: number;
  };
}

export const PropertyDetails = ({ objInfo }: PropertyDetailsProps) => (
  <section className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 border border-black/5 shadow-sm">
    <h2 className="text-2xl font-bold mb-8 border-b border-[#2E2E2E]/5 pb-2 font-geist">Detalles de la propiedad</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-4">
      <DetailItem strLabel="Tipo de propiedad" strValue={objInfo.strType} />
      <DetailItem strLabel="Habitaciones" strValue={objInfo.intRooms} />
      <DetailItem strLabel="Tipo de operación" strValue={objInfo.strOperation} />
      <DetailItem strLabel="Baños" strValue={objInfo.intBaths} />
      <DetailItem strLabel="Departamento" strValue={objInfo.strDept} />
      <DetailItem strLabel="Nro de Plantas" strValue={objInfo.intFloors} />
      <DetailItem strLabel="Zona" strValue={objInfo.strZone} />
      <DetailItem strLabel="Garajes" strValue={objInfo.intGarages} />
    </div>
  </section>
);

const DetailItem = ({ strLabel, strValue }: { strLabel: string; strValue: string | number }) => (
  <div className="flex justify-between items-center py-2 border-b border-[#2E2E2E]/5 last:border-0">
    <span className="text-[#2E2E2E]/70 font-medium font-geist">{strLabel}</span>
    <span className="bg-[#C26E5A] text-white px-5 py-1 rounded-full text-sm font-bold min-w-[50px] text-center">
      {strValue ?? "0"}
    </span>
  </div>
);