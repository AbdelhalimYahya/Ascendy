export interface Paginated<T> {
  total: number;
  page: number;
  limit: number;
  pages: number;
  items: T[];
}

export function paginate<T>(total: number, page: number, limit: number, items: T[]): Paginated<T> {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safePage = Math.max(page, 1);
  return {
    total,
    page: safePage,
    limit: safeLimit,
    pages: Math.ceil(total / safeLimit) || 1,
    items,
  };
}
