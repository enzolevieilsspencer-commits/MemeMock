import { Trade } from '../types/trades'

export interface MockApeData {
  pnlSol: number
  solInvested: number
  solReceived: number
  timestamp: number
  tokenName: string
}

export function convertMockApeToTrades(mockapeData: MockApeData[]): Trade[] {
  return mockapeData.map((data, index) => {
    // Calculer les trades basés sur les données MockApe
    const date = new Date(data.timestamp).toISOString()
    const asset = data.tokenName
    
    // Créer un trade d'achat (investissement)
    const buyTrade: Trade = {
      date,
      asset,
      side: 'buy',
      quantity: data.solInvested,
      price: 1, // Prix en SOL
      fees: 0.01, // Fee estimée
      symbol: asset,
      total: data.solInvested,
      pnl: 0
    }
    
    // Créer un trade de vente (retour)
    const sellTrade: Trade = {
      date: new Date(data.timestamp + 1000).toISOString(), // 1 seconde après
      asset,
      side: 'sell',
      quantity: data.solReceived,
      price: 1, // Prix en SOL
      fees: 0.01, // Fee estimée
      symbol: asset,
      total: data.solReceived,
      pnl: data.pnlSol
    }
    
    return [buyTrade, sellTrade]
  }).flat()
}

export function detectDataFormat(jsonData: string): 'trades' | 'mockape' | 'unknown' {
  try {
    const data = JSON.parse(jsonData)
    
    if (Array.isArray(data)) {
      // Vérifier si c'est un format de trades
      if (data.length > 0 && data[0].date && data[0].asset && data[0].side) {
        return 'trades'
      }
      
      // Vérifier si c'est un format MockApe
      if (data.length > 0 && data[0].pnlSol !== undefined && data[0].tokenName) {
        return 'mockape'
      }
    }
    
    return 'unknown'
  } catch {
    return 'unknown'
  }
}
