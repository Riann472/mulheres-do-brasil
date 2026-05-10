import { useRef, useState } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import * as XLSX from 'xlsx'
import type { SheetData } from '../types'

interface Props {
  onData: (sheets: SheetData[], fileName: string) => void
}

export function FileUpload({ onData }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function parseFile(file: File) {
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const sheets: SheetData[] = workbook.SheetNames.map((name) => {
          const ws = workbook.Sheets[name]
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
            defval: '',
            raw: false,
          })
          const columns =
            rows.length > 0
              ? Object.keys(rows[0])
              : XLSX.utils
                  .sheet_to_json<string[]>(ws, { header: 1 })[0]
                  ?.map(String) ?? []
          return {
            name,
            columns,
            rows: rows as SheetData['rows'],
          }
        })
        onData(sheets, file.name)
      } catch {
        setError('Não foi possível ler o arquivo. Verifique se é um Excel válido.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            SENAI — Visualizador de Dados
          </h1>
        </div>
        <p className="text-gray-500 text-sm">
          Importe uma planilha Excel para explorar e filtrar os dados
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          w-full max-w-lg border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${dragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/30'
          }
        `}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${dragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <svg className={`w-8 h-8 ${dragging ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-gray-700 font-medium">
              {dragging ? 'Solte o arquivo aqui' : 'Arraste um arquivo ou clique para selecionar'}
            </p>
            <p className="text-gray-400 text-sm mt-1">.xlsx, .xls, .csv</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
