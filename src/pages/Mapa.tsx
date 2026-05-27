import { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useData } from '../context/DataContext'
import { Link } from 'react-router-dom'

// ──────────────────────────────────────────────────
// Coordenadas aproximadas dos bairros de Fortaleza
// ──────────────────────────────────────────────────
const BAIRRO_COORDS: Record<string, [number, number]> = {
  'Aldeota':             [-3.7333, -38.5000],
  'Meireles':            [-3.7249, -38.5028],
  'Messejana':           [-3.8167, -38.4833],
  'Barra do Ceará':      [-3.6967, -38.5797],
  'Conjunto Ceará':      [-3.7933, -38.5922],
  'Mondubim':            [-3.8017, -38.5722],
  'Parangaba':           [-3.7767, -38.5567],
  'Benfica':             [-3.7183, -38.5483],
  'Centro':              [-3.7272, -38.5433],
  'Lagoa Redonda':       [-3.8200, -38.4650],
  'Granja Lisboa':       [-3.7983, -38.6133],
  'Siqueira':            [-3.8067, -38.5950],
  'Passaré':             [-3.8017, -38.5233],
  'Jangurussu':          [-3.8383, -38.5017],
  'Itaperi':             [-3.7817, -38.5517],
  'Antônio Bezerra':     [-3.7283, -38.5833],
  'Bom Jardim':          [-3.7883, -38.6033],
  'Prefeito José Walter':[-3.8183, -38.5533],
  'Damas':               [-3.7517, -38.5317],
  'Fátima':              [-3.7467, -38.5283],
  'Parquelândia':        [-3.7517, -38.5533],
  'Dendê':               [-3.8283, -38.5183],
  'Edson Queiroz':       [-3.7817, -38.4683],
  'Sapiranga':           [-3.7617, -38.4683],
  'Cocó':                [-3.7467, -38.4867],
  'Água Fria':           [-3.7517, -38.5833],
  'João XXIII':          [-3.7483, -38.5617],
  'Varjota':             [-3.7267, -38.4983],
  'Praia do Futuro':     [-3.7567, -38.4533],
  'Serviluz':            [-3.7283, -38.4550],
  'Vicente Pinzon':      [-3.7317, -38.4683],
  'Mucuripe':            [-3.7233, -38.4733],
  'Maracanau':           [-3.8767, -38.6283],
  'Caucaia':             [-3.7283, -38.6567],
  'Aeroporto':           [-3.7783, -38.5333],
  'Serrinha':            [-3.7933, -38.5433],
  'Dias Macedo':         [-3.8100, -38.4900],
  'Aerolândia':          [-3.7850, -38.5183],
  'Couto Fernandes':     [-3.7583, -38.5617],
  'Genibaú':             [-3.7900, -38.5967],
  'Henrique Jorge':      [-3.7600, -38.5767],
  'Quintino Cunha':      [-3.7317, -38.5833],
  'Padre Andrade':       [-3.7367, -38.5700],
  'Monte Castelo':       [-3.7317, -38.5633],
  'Floresta':            [-3.7433, -38.5700],
  'Rodolfo Teófilo':     [-3.7517, -38.5700],
  'Presidente Kennedy':  [-3.7633, -38.5817],
  'Barroso':             [-3.8000, -38.5083],
  'Canindezinho':        [-3.8183, -38.6083],
  'Bonsucesso':          [-3.7733, -38.5850],
  'Pirambu':             [-3.7102, -38.5528],
  'Cais do Porto':       [0,0],
  'Conjunto Palmeiras':  [0,0],
  'Joaquim Távora':      [0,0],
  'Moura Brasil':        [0,0],
  'Papicu':              [0,0],

}

// ──────────────────────────────────────────────────

type BairroInfo = {
  nome: string
  count: number
  cursos: Record<string, number>
  coords: [number, number]
  empregados: number
}

function getColor(count: number, max: number): string {
  const ratio = count / max
  if (ratio > 0.75) return '#be123c'
  if (ratio > 0.5)  return '#e11d48'
  if (ratio > 0.25) return '#fb7185'
  return '#fda4af'
}

export function Mapa() {
  const { students, hasData } = useData()

  const bairroData = useMemo<BairroInfo[]>(() => {
    if (!hasData) return []
    const counts: Record<string, { count: number; cursos: Record<string, number>; empregados: number }> = {}

    students.forEach((s) => {
      const b = s['Bairro'] || 'Não informado'
      if (!counts[b]) counts[b] = { count: 0, cursos: {}, empregados: 0 }
      counts[b].count++
      const c = s['Área do Curso'] || 'Outro'
      counts[b].cursos[c] = (counts[b].cursos[c] ?? 0) + 1
      if (String(s['Conseguiu Emprego?'] ?? '').toLowerCase() === 'sim') {
        counts[b].empregados++
      }
    })

    return Object.entries(counts)
      .map(([nome, data]) => ({
        nome,
        count: data.count,
        cursos: data.cursos,
        empregados: data.empregados,
        coords: BAIRRO_COORDS[nome],
      }))
      .filter((b): b is BairroInfo => Boolean(b.coords))
  }, [students, hasData])

  const unmappedBairros = useMemo(() => {
    if (!hasData) return []
    const counts: Record<string, number> = {}
    students.forEach((s) => {
      const b = s['Bairro'] || 'Não informado'
      counts[b] = (counts[b] ?? 0) + 1
    })
    return Object.entries(counts)
      .filter(([nome]) => !BAIRRO_COORDS[nome])
      .sort((a, b) => b[1] - a[1])
  }, [students, hasData])

  const maxCount = useMemo(
    () => Math.max(...bairroData.map((b) => b.count), 1),
    [bairroData]
  )

  const totalMapped = useMemo(
    () => bairroData.reduce((s, b) => s + b.count, 0),
    [bairroData]
  )

  if (!hasData) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <span className="text-5xl mb-4">🗺️</span>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Nenhum dado carregado</h2>
        <p className="text-gray-400 text-sm max-w-xs">
          Importe uma planilha na página de{' '}
          <Link to="/dados" className="text-rose-600 underline font-medium">
            Dados
          </Link>{' '}
          para visualizar o mapa.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-gray-900">Mapa de Fortaleza</h1>
          <p className="text-gray-400 text-sm mt-1">
            Distribuição geográfica das participantes —{' '}
            <strong className="text-gray-600">{bairroData.length} bairros</strong> mapeados,{' '}
            <strong className="text-gray-600">{totalMapped}</strong> alunos localizadas
          </p>
        </div>

        {/* Map card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Legenda */}
          <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="font-semibold text-gray-600">Concentração de alunos:</span>
            {[
              { color: '#fda4af', label: 'Baixa' },
              { color: '#fb7185', label: 'Média' },
              { color: '#e11d48', label: 'Alta' },
              { color: '#be123c', label: 'Muito alta' },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>

          <MapContainer
            center={[-3.7820, -38.5560]}
            zoom={12}
            style={{ height: '580px', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {bairroData.map((bairro) => {
              const radius = 8 + (bairro.count / maxCount) * 26
              const fillColor = getColor(bairro.count, maxCount)
              const topCurso = Object.entries(bairro.cursos).sort(
                (a, b) => b[1] - a[1]
              )[0]
              const empPct =
                bairro.count > 0
                  ? Math.round((bairro.empregados / bairro.count) * 100)
                  : 0

              return (
                <CircleMarker
                  key={bairro.nome}
                  center={bairro.coords}
                  radius={radius}
                  pathOptions={{
                    fillColor,
                    color: '#7f1d1d',
                    weight: 1.5,
                    fillOpacity: 0.75,
                  }}
                >
                  {/* Hover label */}
                  <Tooltip direction="top" offset={[0, -radius]} opacity={1}>
                    <span className="font-semibold">{bairro.nome}</span>
                    {' — '}
                    {bairro.count} aluno{bairro.count !== 1 ? 's' : ''}
                  </Tooltip>

                  {/* Click popup */}
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          marginBottom: 6,
                          color: '#1f2937',
                        }}
                      >
                        {bairro.nome}
                      </p>
                      <table style={{ fontSize: 12, width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr>
                            <td style={{ color: '#6b7280', paddingBottom: 2 }}>Participantes</td>
                            <td style={{ fontWeight: 600, textAlign: 'right' }}>{bairro.count}</td>
                          </tr>
                          <tr>
                            <td style={{ color: '#6b7280', paddingBottom: 2 }}>Conseguiram emprego</td>
                            <td style={{ fontWeight: 600, textAlign: 'right' }}>{empPct}%</td>
                          </tr>
                          {topCurso && (
                            <tr>
                              <td style={{ color: '#6b7280' }}>Área principal</td>
                              <td style={{ fontWeight: 600, textAlign: 'right' }}>{topCurso[0]}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {Object.keys(bairro.cursos).length > 1 && (
                        <div style={{ marginTop: 8 }}>
                          <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Todas as áreas:</p>
                          {Object.entries(bairro.cursos)
                            .sort((a, b) => b[1] - a[1])
                            .map(([area, n]) => (
                              <div
                                key={area}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: 11,
                                  color: '#374151',
                                }}
                              >
                                <span>{area}</span>
                                <span style={{ fontWeight: 600, marginLeft: 8 }}>{n}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>

        {/* Bairros sem coordenadas */}
        {unmappedBairros.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-700 text-sm mb-1">
              Bairros não mapeados ({unmappedBairros.length})
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Esses bairros estão na planilha mas não possuem coordenadas cadastradas.
            </p>
            <div className="flex flex-wrap gap-2">
              {unmappedBairros.map(([nome, count]) => (
                <span
                  key={nome}
                  className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full"
                >
                  {nome}
                  <span className="bg-gray-200 text-gray-500 rounded-full px-1.5 py-0.5 text-[10px]">
                    {count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}