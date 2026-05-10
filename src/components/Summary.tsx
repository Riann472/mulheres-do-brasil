interface Props {
  totalRows: number
  visibleRows: number
  totalColumns: number
  fileName?: string
  uploading?: boolean
  onUpdate?: () => void
  onClear?: () => void
  onDownload?: () => void
}

interface CardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  highlight?: boolean
}

function Card({ label, value, icon, highlight }: CardProps) {
  return (
    <div className={`rounded-xl p-4 flex items-center gap-3 border ${highlight ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700'}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${highlight ? 'bg-blue-500' : 'bg-gray-100'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-xs ${highlight ? 'text-blue-100' : 'text-gray-400'}`}>{label}</p>
        <p className="text-xl font-bold truncate">{value}</p>
      </div>
    </div>
  )
}

export function Summary({ totalRows, visibleRows, totalColumns, fileName = 'base.xlsx', uploading, onUpdate, onClear, onDownload }: Props) {
  const filtered = visibleRows < totalRows

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-black text-xs">S</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800 leading-tight">SENAI — Visualizador de Dados</h1>
            <p className="text-xs text-gray-400">Acompanhamento de alunos e egressos</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex cursor-pointer items-center gap-1.5 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Baixar
            </button>
          )}
          {onUpdate && (
            <button
              onClick={onUpdate}
              disabled={uploading}
              className="flex cursor-pointer items-center gap-1.5 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Atualizar base
                </>
              )}
            </button>
          )}
          {onClear && (
            <button
              onClick={onClear}
              className="flex cursor-pointer items-center gap-1.5 text-sm font-medium border border-red-200 bg-white hover:bg-red-50 text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpar base
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card
          label={filtered ? 'Linhas (filtradas)' : 'Total de alunos'}
          value={filtered ? `${visibleRows} / ${totalRows}` : totalRows}
          highlight={filtered}
          icon={
            <svg className={`w-5 h-5 ${filtered ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
          }
        />
        <Card
          label="Colunas"
          value={totalColumns}
          icon={
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          }
        />
        <Card
          label="Base de dados"
          value={fileName}
          icon={
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>
    </div>
  )
}
