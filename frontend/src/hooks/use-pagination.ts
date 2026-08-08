import { useMemo, useState } from 'react'

export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1)

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(items.length / pageSize))
  }, [items.length, pageSize])

  const currentPage = Math.min(page, totalPages)

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [currentPage, items, pageSize])

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  function resetPage() {
    setPage(1)
  }

  return {
    page: currentPage,
    totalPages,
    pagedItems,
    goToPage,
    resetPage,
  }
}
