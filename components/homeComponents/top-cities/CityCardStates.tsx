export function CityCardSkeleton(): React.ReactNode {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl animate-pulse"
      style={{ background: "var(--muted)" }}
    />
  );
}

export function EmptyCard(): React.ReactNode {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl flex items-center justify-center"
      style={{ background: "var(--muted)" }}
    >
      <p
        className="text-sm font-medium text-center px-4"
        style={{ color: "var(--muted-foreground)" }}
      >
        Aún no disponible
      </p>
    </div>
  );
}