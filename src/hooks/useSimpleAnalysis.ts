import { useState, useEffect } from 'react'
import { SimpleTradeAnalyzer, SimpleAnalysis } from '../utils/simpleAnalyzer'

export function useSimpleAnalysis(jsonData: string | null, solPriceUsd?: number) {
  const [analysis, setAnalysis] = useState<SimpleAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!jsonData) {
      setAnalysis(null)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = SimpleTradeAnalyzer.analyzeData(jsonData)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'analyse')
      setAnalysis(null)
    } finally {
      setIsLoading(false)
    }
  }, [jsonData, solPriceUsd]) // Recalculer quand le prix SOL change

  const exportToTable = () => {
    if (!analysis) return
    
    const tableData = SimpleTradeAnalyzer.exportToTable(analysis)
    const blob = new Blob([tableData], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mockape-analysis-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    analysis,
    error,
    isLoading,
    exportToTable
  }
}
