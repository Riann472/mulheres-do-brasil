import { createContext, useContext, useState, useCallback } from 'react'
import { parseStudentsFromBuffer } from '../data/loader'
import type { StudentRow } from '../types'

interface DataContextValue {
  students: StudentRow[]
  fileName: string
  uploading: boolean
  uploadError: string | null
  hasData: boolean
  readFile: (file: File) => void
  clearData: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const readFile = useCallback((file: File) => {
    setUploadError(null)
    setUploading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const rows = parseStudentsFromBuffer(ev.target!.result as ArrayBuffer)
        setStudents(rows)
        setFileName(file.name)
      } catch {
        setUploadError('Não foi possível ler o arquivo. Verifique se é um Excel válido.')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const clearData = useCallback(() => {
    setStudents([])
    setFileName('')
    setUploadError(null)
  }, [])

  return (
    <DataContext.Provider
      value={{ students, fileName, uploading, uploadError, hasData: students.length > 0, readFile, clearData }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
