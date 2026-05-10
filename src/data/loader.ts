import * as XLSX from 'xlsx'
import type { StudentRow } from '../types'

export function parseStudentsFromBuffer(buffer: ArrayBuffer): StudentRow[] {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true })
  const sheetName = workbook.SheetNames[0]
  const ws = workbook.Sheets[sheetName]
  const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
    defval: '',
    raw: false,
  })

  return raw.map((r) => ({
    ID: Number(r['ID']),
    'Nome Completo': r['Nome Completo'],
    Bairro: r['Bairro'],
    Comunidade: r['Comunidade'],
    'TVM (Anos)': Number(r['TVM (Anos)']),
    Sexo: r['Sexo'] as StudentRow['Sexo'],
    Escolaridade: r['Escolaridade'] as StudentRow['Escolaridade'],
    Idade: Number(r['Idade']),
    Curso: r['Curso'],
    'Área do Curso': r['Área do Curso'] as StudentRow['Área do Curso'],
    'Status do Curso': r['Status do Curso'] as StudentRow['Status do Curso'],
    'Conseguiu Emprego?': r['Conseguiu Emprego?'] as StudentRow['Conseguiu Emprego?'],
    'Impacto na Vida': r['Impacto na Vida'] as StudentRow['Impacto na Vida'],
    'Pontos Positivos': r['Pontos Positivos'],
    'Pontos Negativos': r['Pontos Negativos'],
    'Pretensão de Aplicação': r['Pretensão de Aplicação'] as StudentRow['Pretensão de Aplicação'],
  }))
}

export async function loadStudents(): Promise<StudentRow[]> {
  const response = await fetch('/base.xlsx')
  if (!response.ok) throw new Error('Não foi possível carregar base.xlsx')
  return parseStudentsFromBuffer(await response.arrayBuffer())
}
