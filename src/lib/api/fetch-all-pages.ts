import type { PaginationParams } from "./types";

// For forms and coverage calculations that need the full set of related records.
export async function fetchAllPages<T>(
  fetchPage: (params: PaginationParams) => Promise<T[]>,
  signal: AbortSignal,
): Promise<T[]> {
  const limit = 100;
  const items: T[] = [];
  for (let offset = 0; ; offset += limit) {
    signal.throwIfAborted();
    const page = await fetchPage({ limit, offset }) ?? [];
    items.push(...page);
    if (page.length < limit) return items;
  }
}
