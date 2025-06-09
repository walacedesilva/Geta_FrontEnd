/**
 * Interface genérica para representar um resultado paginado da API.
 */
export interface PagedResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
