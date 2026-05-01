import { CardSkeleton } from "@/components/ui/skeleton";

export default function CommercialLoading() {
  return (
    <div className="bg-slate-50 py-10 md:py-16">
      <div className="mx-auto max-w-[1200px] space-y-6 px-5 md:px-8">
        <CardSkeleton />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
        <CardSkeleton />
      </div>
    </div>
  );
}
