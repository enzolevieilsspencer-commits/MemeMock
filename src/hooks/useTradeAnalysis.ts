// import { useState, useMemo } from 'react'
// import { Trade, TradeAnalysis, ChartData, AssetBreakdown } from '../types/trades'
// import { parseTradesData, calculateTradeAnalysis, generateChartData, generateAssetBreakdown } from '../utils/tradeAnalyzer'

export function useTradeAnalysis(_jsonData: string | null) {
  // const [error, setError] = useState<string | null>(null)

  // const analysis = useMemo(() => {
  //   if (!jsonData) {
  //     setError(null)
  //     return null
  //   }

  //   try {
  //     setError(null)
  //     const trades = parseTradesData(jsonData)
  //     const tradeAnalysis = calculateTradeAnalysis(trades)
  //     const chartData = generateChartData(trades)
  //     const assetBreakdown = generateAssetBreakdown(trades)

  //     return {
  //       trades,
  //       analysis: tradeAnalysis,
  //       chartData,
  //       assetBreakdown
  //     }
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Erreur inconnue')
  //     return null
  //   }
  // }, [jsonData])

  // return {
  //   analysis,
  //   error,
  //   isLoading: jsonData !== null && analysis === null && error === null
  // }
  
  return {
    analysis: null,
    error: null,
    isLoading: false
  }
}