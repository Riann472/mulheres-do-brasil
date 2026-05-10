import type { FilterState, Row } from '../types'

interface Props {
  columns: string[]
  rows: Row[]
  filters: FilterState
  onChange: (filters: FilterState) => void
  onReset: () => void
}

function getUniqueValues(rows: Row[], column: string): string[] {
  const set = new Set<string>()
  for (const row of rows) {
    const v = row[column]
    if (v !== null && v !== undefined && v !== '') set.add(String(v))
  }
  return Array.from(set).sort()
}

function isDropdown(rows: Row[], column: string): boolean {
  const unique = getUniqueValues(rows, column)
  return unique.length > 0 && unique.length <= 30
}

export function Filters({ columns, rows, filters, onChange, onReset }: Props) {
  const hasActiveFilters =
    filters.globalSearch !== '' ||
    Object.values(filters.columnFilters).some((v) => v !== '')

  function setGlobal(value: string) {
    onChange({ ...filters, globalSearch: value })
  }

  function setColumn(col: string, value: string) {
    onChange({
      ...filters,
      columnFilters: { ...filters.columnFilters, [col]: value },
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Filtros</h2>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpar tudo
          </button>
        )}
      </div>

      {/* Busca global */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar em todas as colunas..."
          value={filters.globalSearch}
          onChange={(e) => setGlobal(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filtros por coluna */}
      {columns.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {columns.map((col) => (
            <div key={col} className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 truncate" title={col}>
                {col}
              </label>
              {isDropdown(rows, col) ? (
                <select
                  value={filters.columnFilters[col] ?? ''}
                  onChange={(e) => setColumn(col, e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Todos</option>
                  {getUniqueValues(rows, col).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.columnFilters[col] ?? ''}
                  onChange={(e) => setColumn(col, e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
