import { useMemo } from 'react'
import { PnLChart } from '../components/PnLChart'
import { convertJsonToPnLData, PnLDataPoint as ConverterPnLDataPoint } from '../utils/pnlDataConverter'
import { useCryptoPrices } from '../hooks/useCryptoPrices'

// Interface pour PnLChart
interface PnLDataPoint {
  date: string
  timestamp: number
  pnl: number
  cumulativePnl: number
  tokenName?: string
  asset?: string
  fees?: number
  isDayStart?: boolean
}

interface VueGraphiquesProps {
  jsonData?: string | null
}

export function VueGraphiques({ jsonData }: VueGraphiquesProps) {
  const { prices } = useCryptoPrices()
  
  const pnlData = useMemo(() => {
    if (!jsonData) return []
    const solPriceUsd = prices.SOL.price || 1 // Utiliser le prix SOL actuel ou 1 par défaut
    const converterData = convertJsonToPnLData(jsonData, solPriceUsd)
    
    // Convertir les données du converter vers le format attendu par PnLChart
    return converterData.map((item: ConverterPnLDataPoint): PnLDataPoint => ({
      date: item.date || new Date(item.timestamp).toISOString(),
      timestamp: item.timestamp,
      pnl: item.pnl,
      cumulativePnl: item.cumulativePnL,
      tokenName: item.tokenName,
      asset: item.asset,
      fees: item.fees,
      isDayStart: item.isDayStart
    }))
  }, [jsonData, prices.SOL.price])

  if (!jsonData || pnlData.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      {/* Graphique PnL Principal */}
      <PnLChart data={pnlData} title="Realized PNL" solPriceUsd={prices.SOL.price || undefined} />
    </section>
  )
}