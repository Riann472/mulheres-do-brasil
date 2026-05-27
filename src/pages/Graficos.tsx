import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from 'recharts'
import { useData } from '../context/DataContext'
import { Link } from 'react-router-dom'

// ── Palette ──────────────────────────────────────────────────────
const ROSE   = '#e11d48'
const PALETTE = ['#e11d48','#3b82f6','#a855f7','#f97316','#10b981','#f59e0b','#6b7280','#ec4899','#14b8a6','#8b5cf6']

const AREA_COLORS: Record<string, string> = {
  Gastronomia:    '#f97316',
  Tecnologia:     '#3b82f6',
  Gestão:         '#a855f7',
  Infraestrutura: '#eab308',
  Automotiva:     '#6b7280',
  Comunicação:    '#e11d48',
}

type Item = { name: string; value: number }

// ── Helpers ──────────────────────────────────────────────────────
function countBy(arr: any[], key: string): Item[] {
  const m: Record<string, number> = {}
  arr.forEach((r) => { const v = r[key] || 'Não informado'; m[v] = (m[v] ?? 0) + 1 })
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))
}

// ── Sub-components ───────────────────────────────────────────────
const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-xl text-sm">
      {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
      {payload.map((e: any, i: number) => (
        <p key={i} style={{ color: e.color || e.fill || ROSE }} className="font-medium">
          {e.name}: <span className="text-gray-900 font-bold">{e.value}</span>
        </p>
      ))}
    </div>
  )
}

function Card({ title, subtitle, children, span2 = false }: {
  title: string; subtitle?: string; children: React.ReactNode; span2?: boolean
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${span2 ? 'md:col-span-2' : ''}`}>
      <h3 className="font-bold text-gray-800 text-base">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────
export function Graficos() {
  const { students, hasData } = useData()

  // Derived datasets
  const areaData   = useMemo(() => countBy(students, 'Área do Curso'), [students])
  const statusData = useMemo(() => countBy(students, 'Status do Curso'), [students])
  const empregoData= useMemo(() => countBy(students, 'Conseguiu Emprego?'), [students])
  const bairroData = useMemo(() => countBy(students, 'Bairro').slice(0, 10), [students])
  const escolData  = useMemo(() => countBy(students, 'Escolaridade'), [students])
  const impactoData= useMemo(() => countBy(students, 'Impacto na Vida'), [students])
  const sexoData   = useMemo(() => countBy(students, 'Sexo'), [students])
  const pretensaoData = useMemo(() => countBy(students, 'Pretensão de Aplicação'), [students])
  const pontPosData   = useMemo(() => countBy(students, 'Pontos Positivos'), [students])
  const pontNegData   = useMemo(() => countBy(students, 'Pontos Negativos'), [students])
  const cursoData  = useMemo(() => countBy(students, 'Curso'), [students])

  // Faixa etária
  const idadeData = useMemo<Item[]>(() => {
    const f: Record<string, number> = { '< 20':0,'20–29':0,'30–39':0,'40–49':0,'50–59':0,'60+':0 }
    students.forEach((s) => {
      const a = Number(s['Idade'])
      if (!a) return
      if (a < 20) f['< 20']++
      else if (a < 30) f['20–29']++
      else if (a < 40) f['30–39']++
      else if (a < 50) f['40–49']++
      else if (a < 60) f['50–59']++
      else f['60+']++
    })
    return Object.entries(f).map(([name, value]) => ({ name, value }))
  }, [students])

  // TVM — faixas
  const tvmData = useMemo<Item[]>(() => {
    const f: Record<string, number> = { '1–10':0,'11–20':0,'21–30':0,'31–40':0,'41–50':0 }
    students.forEach((s) => {
      const v = Number(s['TVM (Anos)'])
      if (!v) return
      if (v <= 10) f['1–10']++
      else if (v <= 20) f['11–20']++
      else if (v <= 30) f['21–30']++
      else if (v <= 40) f['31–40']++
      else f['41–50']++
    })
    return Object.entries(f).map(([name, value]) => ({ name, value }))
  }, [students])

  // Área × Status (stacked bars)
  const areaStatusData = useMemo(() => {
    const m: Record<string, Record<string, number>> = {}
    students.forEach((s) => {
      const a = s['Área do Curso'] || 'Outro'
      const st = s['Status do Curso'] || 'Outro'
      if (!m[a]) m[a] = {}
      m[a][st] = (m[a][st] ?? 0) + 1
    })
    return Object.entries(m).map(([area, counts]) => ({
      name: area, ...counts,
    }))
  }, [students])

  // Taxa de emprego por área
  const empregoAreaData = useMemo<Item[]>(() => {
    const total: Record<string, number> = {}
    const sim:   Record<string, number> = {}
    students.forEach((s) => {
      const a = s['Área do Curso'] || 'Outro'
      total[a] = (total[a] ?? 0) + 1
      if (String(s['Conseguiu Emprego?'] ?? '').toLowerCase() === 'sim')
        sim[a] = (sim[a] ?? 0) + 1
    })
    return Object.entries(total).map(([name, t]) => ({
      name, value: Math.round(((sim[name] ?? 0) / t) * 100),
    })).sort((a, b) => b.value - a.value)
  }, [students])

  // Radar: escolaridade × áreas (normalised)
  const radarData = useMemo(() => {
    const areas = [...new Set(students.map((s) => s['Área do Curso']))] as string[]
    const escolMap: Record<string, Record<string, number>> = {}
    students.forEach((s) => {
      const e = s['Escolaridade'] || 'N/A'
      const a = s['Área do Curso'] || 'N/A'
      if (!escolMap[e]) escolMap[e] = {}
      escolMap[e][a] = (escolMap[e][a] ?? 0) + 1
    })
    return Object.entries(escolMap).map(([escol, byArea]) => {
      const row: Record<string, any> = { subject: escol }
      areas.forEach((a) => { row[a] = byArea[a] ?? 0 })
      return row
    })
  }, [students])

  // KPIs
  const kpis = useMemo(() => {
    if (!hasData || !students.length) return null
    const concluidos = students.filter((s) => s['Status do Curso'] === 'Concluído').length
    const sim = students.filter((s) => String(s['Conseguiu Emprego?'] ?? '').toLowerCase() === 'sim').length
    const bairros = new Set(students.map((s) => s['Bairro'])).size
    const mediaIdade = Math.round(students.reduce((acc, s) => acc + (Number(s['Idade']) || 0), 0) / students.length)
    return {
      total: students.length,
      conclusao: Math.round((concluidos / students.length) * 100),
      emprego: Math.round((sim / students.length) * 100),
      bairros,
      mediaIdade,
    }
  }, [students, hasData])

  if (!hasData) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <span className="text-5xl mb-4">📊</span>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Nenhum dado carregado</h2>
        <p className="text-gray-400 text-sm max-w-xs">
          Importe uma planilha na página de{' '}
          <Link to="/dados" className="text-rose-600 underline font-medium">Dados</Link>{' '}
          para visualizar os gráficos.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-6">

        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-black text-gray-900">Análise Visual</h1>
          <p className="text-gray-400 text-sm mt-1">
            Gráficos e insights sobre as {students.length} participantes do programa
          </p>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {kpis && [
            { label: 'Participantes', value: String(kpis.total), icon: '👩', bg: 'bg-rose-50 border-rose-100' },
            { label: 'Taxa de conclusão', value: `${kpis.conclusao}%`, icon: '🎓', bg: 'bg-blue-50 border-blue-100' },
            { label: 'Conseguiram emprego', value: `${kpis.emprego}%`, icon: '💼', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Bairros atendidos', value: String(kpis.bairros), icon: '📍', bg: 'bg-purple-50 border-purple-100' },
            { label: 'Idade média', value: `${kpis.mediaIdade} anos`, icon: '🎂', bg: 'bg-amber-50 border-amber-100' },
          ].map((k) => (
            <div key={k.label} className={`rounded-2xl border p-5 text-center ${k.bg}`}>
              <div className="text-3xl mb-2">{k.icon}</div>
              <div className="text-2xl font-black text-gray-900 mb-1">{k.value}</div>
              <div className="text-xs text-gray-500">{k.label}</div>
            </div>
          ))}
        </div>

        {/* ── Seção 1: Visão Geral ── */}
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">Visão Geral</p>
        <div className="grid md:grid-cols-2 gap-6">

          {/* Área do Curso – donut */}
          <Card title="Alunos por Área do Curso" subtitle="Distribuição das participantes por área de formação">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={areaData} cx="50%" cy="50%" innerRadius={68} outerRadius={108} paddingAngle={3} dataKey="value">
                  {areaData.map((e, i) => <Cell key={i} fill={AREA_COLORS[e.name] ?? PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip content={<Tip />} />
                <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Status – barras */}
          <Card title="Status do Curso" subtitle="Conclusões, andamentos e evasões">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="value" name="Alunos" radius={[6, 6, 0, 0]}>
                  {statusData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Seção 2: Perfil ── */}
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">Perfil das Participantes</p>
        <div className="grid md:grid-cols-3 gap-6">

          {/* Sexo – pie */}
          <Card title="Gênero" subtitle="Distribuição por identidade de gênero">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={sexoData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {sexoData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Faixa etária */}
          <Card title="Faixa Etária" subtitle="Distribuição das participantes por idade">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={idadeData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="value" name="Alunos" radius={[6, 6, 0, 0]}>
                  {idadeData.map((_, i) => <Cell key={i} fill={`hsl(346,${90-i*8}%,${42+i*6}%)`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Escolaridade */}
          <Card title="Escolaridade" subtitle="Nível educacional no momento da inscrição">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={escolData} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} width={110} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="value" name="Alunos" fill="#a855f7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* TVM – area chart (full) */}
        <Card title="Tempo em Situação de Vulnerabilidade (TVM)" subtitle="Distribuição em anos — quanto tempo cada participante estava em situação vulnerável antes do curso">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={tvmData} margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tvmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ROSE} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={ROSE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'anos', position: 'insideRight', dx: 14, fontSize: 10, fill: '#d1d5db' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="value" name="Participantes" stroke={ROSE} strokeWidth={2.5} fill="url(#tvmGrad)" dot={{ r: 5, fill: ROSE, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Seção 3: Empregabilidade ── */}
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">Empregabilidade</p>
        <div className="grid md:grid-cols-2 gap-6">

          {/* Emprego geral – pie */}
          <Card title="Taxa de Empregabilidade" subtitle="Alunos que conseguiram emprego após o curso">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={empregoData} cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`} labelLine={{ strokeWidth: 1 }}>
                  {empregoData.map((_, i) => <Cell key={i} fill={[ROSE,'#10b981'][i % 2]} />)}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Emprego por área */}
          <Card title="Taxa de Emprego por Área" subtitle="% de participantes que conseguiram emprego em cada área">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={empregoAreaData} layout="vertical" margin={{ top: 0, right: 30, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} unit="%" domain={[0, 50]} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} width={90} />
                <Tooltip content={<Tip />} formatter={(v) => [`${v}%`, 'Taxa de emprego']} />
                <Bar dataKey="value" name="Taxa de emprego" radius={[0, 6, 6, 0]}>
                  {empregoAreaData.map((e, i) => <Cell key={i} fill={AREA_COLORS[e.name] ?? PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Área × Status (stacked) – full width */}
        <Card title="Status por Área do Curso" subtitle="Distribuição de conclusões, andamentos e evasões dentro de cada área" span2={false}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={areaStatusData} margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip content={<Tip />} />
              <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
              <Bar dataKey="Concluído"    stackId="a" fill="#10b981" radius={[0,0,0,0]} name="Concluído" />
              <Bar dataKey="Em andamento" stackId="a" fill="#f59e0b" name="Em andamento" />
              <Bar dataKey="Evadido"      stackId="a" fill="#e11d48" radius={[6,6,0,0]} name="Evadido" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Seção 4: Impacto & Pretensão ── */}
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">Impacto & Aspirações</p>
        <div className="grid md:grid-cols-3 gap-6">

          {/* Impacto */}
          <Card title="Impacto na Vida" subtitle="Como as participantes avaliam a mudança">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={impactoData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                  {impactoData.map((_, i) => <Cell key={i} fill={['#e11d48','#f97316','#3b82f6'][i % 3]} />)}
                </Pie>
                <Tooltip content={<Tip />} />
                <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Pretensão */}
          <Card title="Pretensão de Aplicação" subtitle="O que pretendem fazer com o conhecimento">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pretensaoData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-10} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="value" name="Participantes" radius={[6, 6, 0, 0]}>
                  {pretensaoData.map((_, i) => <Cell key={i} fill={['#e11d48','#f97316','#3b82f6'][i % 3]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Cursos */}
          <Card title="Cursos Realizados" subtitle="Quantidade de alunos por curso específico">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={cursoData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} width={110} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="value" name="Alunos" radius={[0, 6, 6, 0]}>
                  {cursoData.map((e, i) => <Cell key={i} fill={AREA_COLORS[e.name] ?? PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Seção 5: Feedback ── */}
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">Feedback das Participantes</p>
        <div className="grid md:grid-cols-2 gap-6">

          {/* Pontos Positivos */}
          <Card title="✅ Pontos Positivos" subtitle="Aspectos mais elogiados pelas participantes">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pontPosData} layout="vertical" margin={{ top: 0, right: 20, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} width={160} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="value" name="Menções" fill="#10b981" radius={[0, 6, 6, 0]}>
                  {pontPosData.map((_, i) => (
                    <Cell key={i} fill={`hsl(160,${72-i*4}%,${38+i*4}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Pontos Negativos */}
          <Card title="⚠️ Pontos de Melhoria" subtitle="Aspectos que precisam de atenção segundo as participantes">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pontNegData} layout="vertical" margin={{ top: 0, right: 20, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} width={160} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="value" name="Menções" fill="#f97316" radius={[0, 6, 6, 0]}>
                  {pontNegData.map((_, i) => (
                    <Cell key={i} fill={`hsl(27,${85-i*5}%,${48+i*3}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Seção 6: Distribuição Geográfica ── */}
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">Distribuição Geográfica</p>
        <Card title="Top 10 Bairros" subtitle="Bairros com maior número de participantes inscritas" span2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={bairroData} layout="vertical" margin={{ top: 0, right: 30, left: 100, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} width={100} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" name="Alunos" radius={[0, 6, 6, 0]}>
                {bairroData.map((_, i) => <Cell key={i} fill={`hsl(346,${88-i*5}%,${45+i*3}%)`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Radar escolaridade × área */}
        <Card title="Escolaridade por Área do Curso" subtitle="Perfil educacional das participantes cruzado com a área de formação">
          <ResponsiveContainer width="100%" height={360}>
            <RadarChart cx="50%" cy="50%" outerRadius={130} data={radarData}>
              <PolarGrid stroke="#f3f4f6" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
              {Object.keys(AREA_COLORS).map((area) => (
                <Radar key={area} name={area} dataKey={area} stroke={AREA_COLORS[area]}
                  fill={AREA_COLORS[area]} fillOpacity={0.1} strokeWidth={2} dot />
              ))}
              <Tooltip content={<Tip />} />
              <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

      </div>
    </div>
  )
}