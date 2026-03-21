import { CardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-3 w-28 rounded bg-slate-200" />
            <div className="h-8 w-56 rounded bg-slate-200" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-slate-200" />
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
