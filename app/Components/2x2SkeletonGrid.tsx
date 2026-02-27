


export function ConfigSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-gray-200 p-4">
          <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="mt-2 h-3 w-48 rounded bg-gray-200 animate-pulse" />
          <div className="mt-4 h-10 w-full rounded bg-gray-200 animate-pulse" />
        </div>
      ))}
    </div>
  );
}