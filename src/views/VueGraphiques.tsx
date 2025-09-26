import { useMemo } from 'react'
import { PnLChart } from '../components/PnLChart'
import { convertJsonToPnLData } from '../utils/pnlDataConverter'
import { useCryptoPrices } from '../hooks/useCryptoPrices'

interface VueGraphiquesProps {
  jsonData?: string | null
  onShowImport?: () => void
}

export function VueGraphiques({ jsonData, onShowImport }: VueGraphiquesProps) {
  const { prices } = useCryptoPrices()
  
  const pnlData = useMemo(() => {
    if (!jsonData) return []
    const solPriceUsd = prices.SOL.price || 1 // Utiliser le prix SOL actuel ou 1 par défaut
    return convertJsonToPnLData(jsonData, solPriceUsd)
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