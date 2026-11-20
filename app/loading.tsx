export default function Loading() {
  return (
    <div className="flex min-h-[70svh] items-center justify-center" role="status" aria-label="Loading">
      <span className="h-2 w-2 animate-pulse bg-solar" />
    </div>
  );
}
