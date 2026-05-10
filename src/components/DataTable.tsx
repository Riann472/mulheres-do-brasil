import { useState } from 'react'
import type { Row, SortState } from '../types'

interface Props {
  columns: string[]
  rows: Row[]
  globalSearch: string
}

const PAGE_SIZES = [10, 25, 50, 100]

function highlight(text: string, search: string) {
  if (!search.trim()) return text
  const idx = text.toLowerCase().indexOf(search.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 rounded px-0.5">{text.slice(idx, idx + search.length)}</mark>
      {text.slice(idx + search.length)}
    </>
  )
}

export function DataTable({ columns, rows, globalSearch }: Props) {
  const [sort, setSort] = useState<SortState>({ column: null, direction: null })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  function toggleSort(col: string) {
    setSort((prev) => {
      if (prev.column !== col) return { column: col, direction: 'asc' }
      if (prev.direction === 'asc') return { column: col, direction: 'desc' }
      return { column: null, direction: null }
    })
    setPage(1)
  }

  const sorted = [...rows].sort((a, b) => {
    if (!sort.column || !sort.direction) return 0
    const av = a[sort.column] ?? ''
    const bv = b[sort.column] ?? ''
    const compare = String(av).localeCompare(String(bv), 'pt-BR', { numeric: true })
    return sort.direction === 'asc' ? compare : -compare
  })

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const visible = sorted.slice(start, start + pageSize)

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Nenhum resultado encontrado
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => toggleSort(col)}
                  className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none hover:bg-gray-100 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    {col}
                    <span className="text-gray-400 text-xs">
                      {sort.column === col
                        ? sort.direction === 'asc' ? '↑' : '↓'
                        : '↕'}
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${
                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                }`}
              >
                {columns.map((col) => {
                  const cellValue = row[col] == null ? '' : String(row[col])
                  return (
                    <td key={col} className="px-4 py-2.5 text-gray-700 whitespace-nowrap max-w-xs truncate" title={cellValue}>
                      {highlight(cellValue, globalSearch)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Linhas por página:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="border border-gray-200 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="text-gray-400">
            {start + 1}–{Math.min(start + pageSize, total)} de {total}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <PageBtn onClick={() => setPage(1)} disabled={safePage === 1} label="«" />
          <PageBtn onClick={() => setPage((p) => p - 1)} disabled={safePage === 1} label="‹" />

          {getPaginationRange(safePage, totalPages).map((p, i) =>
            p === '...' ? (
              <span key={`dots-${i}`} className="px-2 text-gray-400">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(Number(p))}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                  p === safePage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            )
          )}

          <PageBtn onClick={() => setPage((p) => p + 1)} disabled={safePage === totalPages} label="›" />
          <PageBtn onClick={() => setPage(totalPages)} disabled={safePage === totalPages} label="»" />
        </div>
      </div>
    </div>
  )
}

function PageBtn({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      {label}
    </button>
  )
}

function getPaginationRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}
