import { useState, useEffect } from 'react'

interface CryptoPrice {
  symbol: string
  price: number
  change24h: number
  volume24h: number
}

interface CryptoPrices {
  BTC: CryptoPrice
  ETH: CryptoPrice
  SOL: CryptoPrice
}

export function useCryptoPrices() {
  // Charger les prix depuis localStorage au démarrage
  const getStoredPrices = (): CryptoPrices => {
    try {
      const stored = localStorage.getItem('crypto-prices')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Vérifier si les données ne sont pas trop anciennes (max 1 minute)
        const now = Date.now()
        if (parsed.timestamp && (now - parsed.timestamp) < 60000) {
          return parsed.prices
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des prix stockés:', error)
    }
    return {
      BTC: { symbol: 'BTC', price: 0, change24h: 0, volume24h: 0 },
      ETH: { symbol: 'ETH', price: 0, change24h: 0, volume24h: 0 },
      SOL: { symbol: 'SOL', price: 0, change24h: 0, volume24h: 0 }
    }
  }

  const [prices, setPrices] = useState<CryptoPrices>(getStoredPrices())
  const [isLoading, setIsLoading] = useState(false)

  // Fonction pour récupérer les prix depuis l'API CoinGecko
  const fetchRealPrices = async () => {
    setIsLoading(true)
    try {
      // API CoinGecko pour les prix en temps réel
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true')
      const data = await response.json()
      
      if (data && data.bitcoin && data.ethereum && data.solana) {
        const newPrices = {
          BTC: {
            symbol: 'BTC',
            price: data.bitcoin.usd,
            change24h: data.bitcoin.usd_24h_change || 0,
            volume24h: data.bitcoin.usd_24h_vol || 0
          },
          ETH: {
            symbol: 'ETH',
            price: data.ethereum.usd,
            change24h: data.ethereum.usd_24h_change || 0,
            volume24h: data.ethereum.usd_24h_vol || 0
          },
          SOL: {
            symbol: 'SOL',
            price: data.solana.usd,
            change24h: data.solana.usd_24h_change || 0,
            volume24h: data.solana.usd_24h_vol || 0
          }
        }
        
        setPrices(newPrices)
        
        // Sauvegarder en localStorage avec timestamp
        localStorage.setItem('crypto-prices', JSON.stringify({
          prices: newPrices,
          timestamp: Date.now()
        }))
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des prix:', error)
      // En cas d'erreur, utiliser des prix de fallback
      setPrices({
        BTC: { symbol: 'BTC', price: 67234.50, change24h: 2.34, volume24h: 45200000000 },
        ETH: { symbol: 'ETH', price: 3456.78, change24h: 1.56, volume24h: 12800000000 },
        SOL: { symbol: 'SOL', price: 145.67, change24h: -2.33, volume24h: 8500000000 }
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Récupérer les prix réels au chargement et toutes les 10 secondes
  useEffect(() => {
    fetchRealPrices()
    const interval = setInterval(fetchRealPrices, 10000) // Mise à jour toutes les 10 secondes
    return () => clearInterval(interval)
  }, [])

  return {
    prices,
    isLoading,
    refetch: fetchRealPrices
  }
}

