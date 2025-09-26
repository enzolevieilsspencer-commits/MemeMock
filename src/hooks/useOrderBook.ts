import { useState, useEffect } from 'react'

interface OrderBookEntry {
  price: number
  amount: number
  total: number
  timestamp: number
}

interface OrderBookData {
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  spread: number
  spreadPercentage: number
}

export function useOrderBook(crypto: 'BTC' | 'ETH' | 'SOL', currentPrice: number) {
  const [orderBook, setOrderBook] = useState<OrderBookData>({
    bids: [],
    asks: [],
    spread: 0,
    spreadPercentage: 0
  })

  const [isLoading, setIsLoading] = useState(true)

  // Générer des données d'order book réalistes basées sur la crypto
  const generateOrderBookData = (crypto: 'BTC' | 'ETH' | 'SOL', price: number): OrderBookData => {
    const basePrice = price
    const volatility = crypto === 'BTC' ? 0.001 : crypto === 'ETH' ? 0.002 : 0.003 // SOL plus volatile
    
    // Générer des bids (ordres d'achat) - prix inférieurs au prix actuel
    const bids: OrderBookEntry[] = []
    for (let i = 0; i < 8; i++) {
      const priceOffset = (i + 1) * volatility * basePrice
      const bidPrice = basePrice - priceOffset
      const amount = Math.random() * (crypto === 'BTC' ? 5 : crypto === 'ETH' ? 50 : 1000)
      const total = bidPrice * amount
      
      bids.push({
        price: bidPrice,
        amount: amount,
        total: total,
        timestamp: Date.now()
      })
    }

    // Générer des asks (ordres de vente) - prix supérieurs au prix actuel
    const asks: OrderBookEntry[] = []
    for (let i = 0; i < 8; i++) {
      const priceOffset = (i + 1) * volatility * basePrice
      const askPrice = basePrice + priceOffset
      const amount = Math.random() * (crypto === 'BTC' ? 5 : crypto === 'ETH' ? 50 : 1000)
      const total = askPrice * amount
      
      asks.push({
        price: askPrice,
        amount: amount,
        total: total,
        timestamp: Date.now()
      })
    }

    // Calculer le spread
    const bestBid = Math.max(...bids.map(b => b.price))
    const bestAsk = Math.min(...asks.map(a => a.price))
    const spread = bestAsk - bestBid
    const spreadPercentage = (spread / basePrice) * 100

    return {
      bids: bids.sort((a, b) => b.price - a.price), // Tri décroissant pour les bids
      asks: asks.sort((a, b) => a.price - b.price), // Tri croissant pour les asks
      spread,
      spreadPercentage
    }
  }

  // Mettre à jour l'order book toutes les 2 secondes
  useEffect(() => {
    setIsLoading(true)
    
    // Générer les données initiales
    const initialData = generateOrderBookData(crypto, currentPrice)
    setOrderBook(initialData)
    setIsLoading(false)

    // Mettre à jour en temps réel
    const interval = setInterval(() => {
      const newData = generateOrderBookData(crypto, currentPrice)
      setOrderBook(newData)
    }, 2000)

    return () => clearInterval(interval)
  }, [crypto, currentPrice])

  return {
    orderBook,
    isLoading
  }
}
