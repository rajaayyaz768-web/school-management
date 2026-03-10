export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const parsePagination = (
  query: Record<string, unknown>
): PaginationParams => {
  const page = Math.max(1, parseInt(String(query.page ?? 1), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? 25), 10) || 25));
  return { page, limit };
};

export const buildPaginationMeta = (
  total: number,
  params: PaginationParams
): PaginationMeta => ({
  page: params.page,
  limit: params.limit,
  total,
  totalPages: Math.ceil(total / params.limit),
});

export const getPrismaSkipTake = (params: PaginationParams) => ({
  skip: (params.page - 1) * params.limit,
  take: params.limit,
});
