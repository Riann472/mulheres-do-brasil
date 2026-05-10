import { useState, useMemo, useRef } from 'react'
import * as XLSX from 'xlsx'
import { useData } from '../context/DataContext'
import { Summary } from '../components/Summary'
import { Filters } from '../components/Filters'
import { DataTable } from '../components/DataTable'
import type { StudentRow, FilterState, Row } from '../types'

const COLUMNS: (keyof StudentRow)[] = [
  'ID',
  'Nome Completo',
  'Bairro',
  'Comunidade',
  'TVM (Anos)',
  'Sexo',
  'Escolaridade',
  'Idade',
  'Curso',
  'Área do Curso',
  'Status do Curso',
  'Conseguiu Emprego?',
  'Impacto na Vida',
  'Pontos Positivos',
  'Pontos Negativos',
  'Pretensão de Aplicação',
]

const EMPTY_FILTERS: FilterState = { globalSearch: '', columnFilters: {} }

function applyFilters(rows: StudentRow[], filters: FilterState): StudentRow[] {
  let result = rows

  if (filters.globalSearch.trim()) {
    const q = filters.globalSearch.toLowerCase()
    result = result.filter((row) =>
      COLUMNS.some((col) => String(row[col] ?? '').toLowerCase().includes(q))
    )
  }

  for (const [col, val] of Object.entries(filters.columnFilters)) {
    if (!val) continue
    const q = val.toLowerCase()
    result = result.filter((row) =>
      String(row[col as keyof StudentRow] ?? '').toLowerCase().includes(q)
    )
  }

  return result
}

export function Dados() {
  const { students, fileName, uploading, uploadError, hasData, readFile, clearData } = useData()
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredRows = useMemo(() => applyFilters(students, filters), [students, filters])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      readFile(file)
      setFilters(EMPTY_FILTERS)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      readFile(file)
      setFilters(EMPTY_FILTERS)
    }
  }

  function handleClear() {
    clearData()
    setFilters(EMPTY_FILTERS)
  }

  function handleDownload() {
    const rows = filteredRows.length > 0 ? filteredRows : students
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Dados')
    const base = fileName.replace(/\.[^.]+$/, '')
    const suffix = filteredRows.length < students.length ? '_filtrado' : ''
    XLSX.writeFile(wb, `${base}${suffix}.xlsx`)
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!hasData) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">S</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">SENAI — Visualizador de Dados</h1>
          </div>
          <p className="text-gray-400 text-sm">Importe uma planilha para começar</p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            w-full max-w-md border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-200
            ${dragging
              ? 'border-rose-400 bg-rose-50'
              : 'border-gray-300 bg-white hover:border-rose-300 hover:bg-rose-50/30'
            }
          `}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${dragging ? 'bg-rose-100' : 'bg-gray-100'}`}>
              {uploading ? (
                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className={`w-7 h-7 ${dragging ? 'text-rose-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-gray-700 font-medium">
                {uploading ? 'Carregando...' : dragging ? 'Solte o arquivo aqui' : 'Arraste ou clique para selecionar'}
              </p>
              <p className="text-gray-400 text-sm mt-1">.xlsx · .xls · .csv</p>
            </div>
          </div>
        </div>

        {uploadError && (
          <p className="mt-4 text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-100">
            {uploadError}
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    )
  }

  // ── Dashboard ────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 min-h-screen">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 space-y-4">
        <Summary
          totalRows={students.length}
          visibleRows={filteredRows.length}
          totalColumns={COLUMNS.length}
          fileName={fileName}
          uploading={uploading}
          onUpdate={() => fileInputRef.current?.click()}
          onClear={handleClear}
          onDownload={handleDownload}
        />
        <Filters
          columns={COLUMNS as string[]}
          rows={students as unknown as Row[]}
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />
        <DataTable
          columns={COLUMNS as string[]}
          rows={filteredRows as unknown as Row[]}
          globalSearch={filters.globalSearch}
        />
      </div>
    </div>
  )
}
