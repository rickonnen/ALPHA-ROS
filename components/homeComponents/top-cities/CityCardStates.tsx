export function CityCardSkeleton(): React.ReactNode {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl animate-pulse bg-muted" />
  );
}
 
export function EmptyCard(): React.ReactNode {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl flex items-center justify-center bg-muted">
      <p className="font-sans text-sm font-medium text-center px-4 text-muted-foreground">
        Aún no disponible
      </p>
    </div>
  );
}