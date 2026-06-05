export type Sexo = 'Masculino' | 'Feminino' | 'Outro'

export type Escolaridade =
  | 'Fundamental Incompleto'
  | 'Fundamental Completo'
  | 'Médio Incompleto'
  | 'Médio Completo'
  | 'Superior Incompleto'
  | 'Superior Completo'

export type AreaCurso =
  | 'Automotiva'
  | 'Comunicação'
  | 'Gastronomia'
  | 'Gestão'
  | 'Infraestrutura'
  | 'Tecnologia'

export type StatusCurso = 'Concluído' | 'Em andamento' | 'Evadido'

export type SimNao = 'Sim' | 'Não'

export type ImpactoVida =
  | 'Inserção no mercado'
  | 'Melhoria na renda'
  | 'Novos conhecimentos'

export type PretensaoAplicacao =
  | 'Abrir negócio'
  | 'Conseguir emprego'
  | 'Melhorar desempenho'

export interface StudentRow {
  ID: number
  'Nome Completo': string
  Bairro: string
  Comunidade: string
  'TVM (Anos)': number
  Sexo: Sexo
  Escolaridade: Escolaridade
  Idade: number
  Curso: string
  'Área do Curso': AreaCurso
  'Status do Curso': StatusCurso
  'Conseguiu Emprego?': SimNao
  'Impacto na Vida': ImpactoVida
  'Pontos Positivos': string
  'Pontos Negativos': string
  'Pretensão de Aplicação': PretensaoAplicacao
}

export type Row = Record<string, string | number | boolean | null>

export interface SheetData {
  name: string
  columns: string[]
  rows: Row[]
}

export interface FilterState {
  globalSearch: string
  columnFilters: Record<string, string>
}

export type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  column: string | null
  direction: SortDirection
}

export const COLUMNS = Object.keys({} as StudentRow) as (keyof StudentRow)[]
