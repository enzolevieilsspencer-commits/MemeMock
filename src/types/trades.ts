export interface Trade {
  date: string
  asset: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  fees: number
  // Champs optionnels pour plus de détails
  symbol?: string
  total?: number
  pnl?: number
}

export interface TradeAnalysis {
  totalTrades: number
  totalVolume: number
  totalFees: number
  totalPnL: number
  winRate: number
  avgWin: number
  avgLoss: number
  maxWin: number
  maxLoss: number
  bestAsset: string
  worstAsset: string
  tradesByAsset: Record<string, AssetStats>
  tradesByDate: Record<string, DailyStats>
  monthlyStats: Record<string, MonthlyStats>
}

export interface AssetStats {
  asset: string
  totalTrades: number
  totalVolume: number
  totalPnL: number
  winRate: number
  avgPrice: number
  totalQuantity: number
}

export interface DailyStats {
  date: string
  totalTrades: number
  totalVolume: number
  totalPnL: number
  trades: Trade[]
}

export interface MonthlyStats {
  month: string
  totalTrades: number
  totalVolume: number
  totalPnL: number
  winRate: number
}

export interface ChartData {
  date: string
  pnl: number
  cumulativePnl: number
  volume: number
  trades: number
}

export interface AssetBreakdown {
  asset: string
  value: number
  percentage: number
  pnl: number
  trades: number
}
