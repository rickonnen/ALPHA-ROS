"use client";

type ReferencePointItem = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  distancia_metros?: number | null;
  tipo_nombre?: string | null;
  tipo_color?: string | null;
};

function formatDistance(distance?: number | null) {
  if (typeof distance !== "number" || Number.isNaN(distance)) return null;
  if (distance < 1000) return `${distance} m`;
  return `${(distance / 1000).toFixed(1)} km`;
}

export function ReferencePointsSection({
  puntosInteres,
}: {
  puntosInteres: ReferencePointItem[];
}) {
  if (puntosInteres.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="bg-white/40 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-sm border border-black/5">
        <h2 className="text-2xl font-bold mb-6 text-[#1F3A4D] border-b border-[#2E2E2E]/5 pb-2">
          Datos referenciales
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {puntosInteres.map((point) => {
            const distanceLabel = formatDistance(point.distancia_metros);

            return (
              <div
                key={point.id}
                className="rounded-2xl border border-[#E5DED4] bg-white/70 px-4 py-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {point.tipo_nombre && (
                    <span
                      className="rounded-full px-2 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: point.tipo_color || "#C26E5A" }}
                    >
                      {point.tipo_nombre}
                    </span>
                  )}
                  <p className="text-sm font-semibold text-[#2E2E2E]">
                    {point.nombre}
                  </p>
                </div>
                {point.descripcion && (
                  <p className="mt-2 text-sm text-[#5B5752]">{point.descripcion}</p>
                )}
                {distanceLabel && (
                  <p className="mt-2 text-xs text-[#7A756E]">
                    Aproximadamente a {distanceLabel} de la propiedad.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
