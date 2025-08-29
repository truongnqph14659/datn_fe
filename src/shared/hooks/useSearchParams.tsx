import {TablePaginationConfig} from 'antd';
import {FilterValue, SorterResult} from 'antd/es/table/interface';
import {useCallback, useMemo, useState} from 'react';

export interface SearchParams {
  page: number;
  limit: number;
  search: string;
  filter?: Record<string, any>;
  sort?: string[]; // ["-created_at"]
}

interface UseSearchParamsOptions {
  defaultPage?: number;
  defaultLimit?: number;
  disablePagination?: boolean;
  defaultSearch?: string[];
  defaultSort?: string[];
}

export const paramsDefaultCommon: UseSearchParamsOptions = {
  defaultPage: 1,
  defaultLimit: 10,
  disablePagination: false,
  defaultSearch: [],
  defaultSort: ['-created_at'],
};

export function useSearchParams<T extends Record<string, any> = SearchParams>(
  initialValue: UseSearchParamsOptions = {},
) {
  const [page, setPage] = useState<number>(initialValue.defaultPage ?? 1);
  const [limit, setLimit] = useState<number>(initialValue.defaultLimit ?? 10);
  const [searchValue, setSearchValue] = useState<string[]>(initialValue.defaultSearch ?? []);
  const [sort, setSort] = useState<string[]>(initialValue.defaultSort ?? ['-created_at']);

  const params = useMemo(() => {
    return {
      page: page,
      limit: limit,
      search: searchValue,
      sort,
    } as unknown as T;
  }, [page, limit, searchValue, sort, initialValue]);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  const handleSearch = useCallback((value: string[]) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const handleChangePagination = useCallback(
    (
      pagination: TablePaginationConfig,
      filters?: Record<string, FilterValue | null>,
      sorter?: SorterResult<any> | SorterResult<any>[],
    ) => {
      // Xử lý pagination
      if (pagination.current) {
        setPage(pagination.current);
      }
      if (pagination.pageSize) {
        setLimit(pagination.pageSize);
      }

      // Xử lý sorter
      if (!Array.isArray(sorter) && sorter?.field && sorter?.order) {
        const sortOrder = sorter.order === 'ascend' ? '' : '-';
        setSort([`${sortOrder}${sorter.field}`]);
      } else if (Array.isArray(sorter) && sorter.length > 0) {
        const newSort = sorter
          .filter((s) => s.field && s.order)
          .map((s) => {
            const sortOrder = s.order === 'ascend' ? '' : '-';
            return `${sortOrder}${s.field}`;
          });
        if (newSort.length > 0) {
          setSort(newSort);
        }
      }
    },
    [],
  );

  return {
    // State
    page,
    limit,
    searchValue,
    sort,
    params,

    // Setters
    setPage,
    setLimit,
    setSearchValue: handleSearch,
    setSort,

    // Handlers
    handleSearch,
    handleChangePagination,
    resetPage,

    reset: useCallback(() => {
      setPage(initialValue.defaultPage ?? 1);
      setLimit(initialValue.defaultLimit ?? 10);
      setSearchValue(initialValue.defaultSearch ?? []);
      setSort(initialValue.defaultSort ?? ['-created_at']);
    }, [initialValue]),
  };
}

export default useSearchParams;
