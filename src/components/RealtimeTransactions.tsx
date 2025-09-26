import { useState, useEffect } from 'react'

interface Transaction {
  id: string
  type: 'buy' | 'sell'
  price: number
  amount: number
  timestamp: number
  crypto: 'BTC' | 'ETH' | 'SOL'
}

interface RealtimeTransactionsProps {
  crypto: 'BTC' | 'ETH' | 'SOL'
  currentPrice: number
}

export function RealtimeTransactions({ crypto, currentPrice }: RealtimeTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Générer des transactions en temps réel
  useEffect(() => {
    const generateTransaction = (): Transaction => {
      const type = Math.random() > 0.5 ? 'buy' : 'sell'
      const volatility = crypto === 'BTC' ? 0.001 : crypto === 'ETH' ? 0.002 : 0.003
      const priceOffset = (Math.random() - 0.5) * volatility * currentPrice
      const price = currentPrice + priceOffset
      
      const amount = crypto === 'BTC' 
        ? Math.random() * 2 + 0.1
        : crypto === 'ETH' 
        ? Math.random() * 20 + 1
        : Math.random() * 500 + 10

      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        price,
        amount,
        timestamp: Date.now(),
        crypto
      }
    }

    // Ajouter une nouvelle transaction toutes les 1-3 secondes
    const addTransaction = () => {
      const newTransaction = generateTransaction()
      setTransactions(prev => {
        const updated = [newTransaction, ...prev].slice(0, 20) // Garder seulement les 20 dernières
        return updated
      })
    }

    // Générer des transactions à intervalles aléatoires
    const scheduleNextTransaction = () => {
      const delay = Math.random() * 2000 + 1000 // 1-3 secondes
      setTimeout(() => {
        addTransaction()
        scheduleNextTransaction()
      }, delay)
    }

    scheduleNextTransaction()
  }, [crypto, currentPrice])

  const formatPrice = (price: number) => {
    if (crypto === 'BTC') {
      return `$${price.toFixed(0)}`
    } else if (crypto === 'ETH') {
      return `$${price.toFixed(0)}`
    } else {
      return `$${price.toFixed(2)}`
    }
  }

  const formatAmount = (amount: number) => {
    if (crypto === 'BTC') {
      return `${amount.toFixed(4)} BTC`
    } else if (crypto === 'ETH') {
      return `${amount.toFixed(3)} ETH`
    } else {
      return `${amount.toFixed(1)} SOL`
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    if (diff < 1000) return 'now'
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
    return `${Math.floor(diff / 60000)}m ago`
  }

  return (
    <div className="space-y-1">
      <div className="text-white font-semibold mb-3">Recent Trades</div>
      <div className="max-h-48 overflow-y-auto space-y-1">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${tx.type === 'buy' ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={`font-medium ${tx.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                {tx.type.toUpperCase()}
              </span>
            </div>
            <div className="text-white/80">
              {formatPrice(tx.price)}
            </div>
            <div className="text-white/60">
              {formatAmount(tx.amount)}
            </div>
            <div className="text-white/50 text-xs">
              {formatTime(tx.timestamp)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
