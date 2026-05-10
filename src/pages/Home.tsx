import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'

const AREA_META: Record<string, { cor: string; icone: string; descricao: string }> = {
  Gastronomia: { cor: 'bg-orange-50 border-orange-200 text-orange-700', icone: '🍴', descricao: 'Confeitaria e culinária profissional' },
  Tecnologia:  { cor: 'bg-blue-50 border-blue-200 text-blue-700',       icone: '💻', descricao: 'Informática e competências digitais' },
  Gestão:      { cor: 'bg-purple-50 border-purple-200 text-purple-700', icone: '📊', descricao: 'Administração e marketing digital' },
  Infraestrutura: { cor: 'bg-yellow-50 border-yellow-200 text-yellow-700', icone: '⚡', descricao: 'Elétrica predial e instalações' },
  Automotiva:  { cor: 'bg-gray-50 border-gray-200 text-gray-700',       icone: '🔧', descricao: 'Mecânica e manutenção veicular' },
  Comunicação: { cor: 'bg-rose-50 border-rose-200 text-rose-700',       icone: '📣', descricao: 'Mídia, design e produção de conteúdo' },
}

const FALLBACK_AREAS = Object.entries(AREA_META).map(([nome, meta]) => ({ nome, ...meta, count: null }))

export function Home() {
  const { students, hasData } = useData()

  const stats = useMemo(() => {
    if (!hasData) return null
    const areas = new Set(students.map((s) => s['Área do Curso'])).size
    const bairros = new Set(students.map((s) => s.Bairro)).size
    const concluidos = students.filter((s) => s['Status do Curso'] === 'Concluído').length
    const taxa = Math.round((concluidos / students.length) * 100)
    return { total: students.length, areas, bairros, taxa }
  }, [students, hasData])

  const areas = useMemo(() => {
    if (!hasData) return FALLBACK_AREAS
    const counts: Record<string, number> = {}
    for (const s of students) {
      const a = s['Área do Curso']
      counts[a] = (counts[a] ?? 0) + 1
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([nome, count]) => ({
        nome,
        count,
        ...(AREA_META[nome] ?? { cor: 'bg-gray-50 border-gray-200 text-gray-700', icone: '📋', descricao: '' }),
      }))
  }, [students, hasData])

  const statCards = [
    { value: stats ? String(stats.total) : '—', label: 'Alunas cadastradas', icon: '👩' },
    { value: stats ? String(stats.areas) : '—', label: 'Áreas de formação', icon: '📚' },
    { value: stats ? String(stats.bairros) : '—', label: 'Bairros atendidos', icon: '📍' },
    { value: stats ? `${stats.taxa}%` : '—', label: 'Taxa de conclusão', icon: '🎓' },
  ]

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-900 via-rose-800 to-red-800 text-white">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Mulheres do Brasil
              <span className="block text-rose-300">&amp; SENAI</span>
            </h1>
            <p className="text-rose-100 text-lg leading-relaxed mb-10 max-w-xl">
              Acompanhe os dados de formação profissional de mulheres em situação de
              vulnerabilidade social, capacitadas pelo SENAI em parceria com o programa
              Mulheres do Brasil.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/dados"
                className="inline-flex items-center gap-2 bg-white text-rose-700 font-semibold px-6 py-3 rounded-xl hover:bg-rose-50 transition-colors shadow-lg"
              >
                Explorar os dados
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href="#sobre"
                className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                Saiba mais
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-12">
          {hasData ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statCards.map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-black text-gray-900 mb-1">{s.value}</div>
                  <div className="text-sm text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
              <span className="text-3xl">📂</span>
              <p className="text-gray-500 font-medium">Nenhum dado carregado ainda.</p>
              <p className="text-gray-400 text-sm max-w-xs">
                Importe uma planilha na página de{' '}
                <Link to="/dados" className="text-rose-600 hover:underline font-medium">
                  Dados
                </Link>{' '}
                para ver as estatísticas aqui.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-rose-600 text-sm font-semibold uppercase tracking-wide">Sobre o programa</span>
            <h2 className="text-3xl font-black text-gray-900 mt-2 mb-5 leading-tight">
              Capacitação que transforma vidas
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              O programa <strong className="text-gray-700">Mulheres do Brasil & SENAI</strong> oferece cursos
              profissionalizantes gratuitos para mulheres de comunidades vulneráveis, com foco na inserção
              no mercado de trabalho e na geração de renda.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              Os dados apresentados neste painel reúnem informações sobre perfil socioeconômico, formação
              obtida, impacto percebido e resultados de empregabilidade de cada participante.
            </p>
            <Link
              to="/dados"
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              Ver painel de dados
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Vulnerabilidade social', desc: 'Mulheres de comunidades com baixo IDH', icon: '🏘️' },
              { label: 'Cursos gratuitos', desc: 'Sem custo para as participantes', icon: '🎁' },
              { label: 'Suporte integral', desc: 'Acompanhamento durante e após o curso', icon: '🤝' },
              { label: 'Foco em emprego', desc: 'Formação orientada ao mercado de trabalho', icon: '💼' },
            ].map((item) => (
              <div key={item.label} className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-semibold text-gray-800 text-sm leading-snug">{item.label}</p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Áreas */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-rose-600 text-sm font-semibold uppercase tracking-wide">Formação profissional</span>
            <h2 className="text-3xl font-black text-gray-900 mt-2">Áreas de atuação</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Seis grandes áreas cobrindo desde habilidades digitais até ofícios tradicionais.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {areas.map((area) => (
              <div
                key={area.nome}
                className={`rounded-2xl border p-5 ${area.cor} transition-transform hover:-translate-y-1 duration-200`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{area.icone}</span>
                  {area.count !== null && (
                    <span className="text-xs font-bold opacity-60">{area.count} alunas</span>
                  )}
                </div>
                <h3 className="font-bold text-base mb-1">{area.nome}</h3>
                <p className="text-xs opacity-80">{area.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="text-3xl font-black text-gray-900 mb-4">Pronto para explorar os dados?</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          {stats
            ? `Filtre, ordene e analise as informações das ${stats.total} participantes do programa.`
            : 'Importe uma planilha para explorar os dados do programa.'}
        </p>
        <Link
          to="/dados"
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg text-base"
        >
          Abrir painel de dados
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <span>Mulheres do Brasil &amp; SENAI — Painel de Dados</span>
        </div>
      </footer>
    </div>
  )
}
