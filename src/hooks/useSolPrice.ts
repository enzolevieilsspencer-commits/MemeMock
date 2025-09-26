import { useEffect, useRef, useState } from 'react'

export type SolPriceState = {
  usd: number | null
  lastUpdated: number | null
  status: 'idle' | 'ok' | 'error'
  error?: string
}

async function fetchFromCryptoCompare(signal?: AbortSignal): Promise<number> {
  try {
    console.log('🔄 Fetching SOL price from CryptoCompare...')
    
    // API CryptoCompare pour SOL/USD
    const endpoint = 'https://min-api.cryptocompare.com/data/price?fsym=SOL&tsyms=USD'
    
    const res = await fetch(endpoint, { 
      signal,
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    if (!res.ok) {
      throw new Error(`CryptoCompare API HTTP ${res.status}: ${res.statusText}`)
    }
    
    const data = await res.json() as { USD?: number }
    const price = data?.USD
    
    if (typeof price !== 'number' || price <= 0 || isNaN(price)) {
      throw new Error('CryptoCompare: Invalid price data received')
    }
    
    console.log(`✅ SOL price from CryptoCompare: $${price.toFixed(2)}`)
    return price
  } catch (e) {
    console.error('❌ CryptoCompare fetch failed:', e)
    throw e
  }
}

async function fetchFromCoincap(signal?: AbortSignal): Promise<number> {
  try {
    const res = await fetch('https://api.coincap.io/v2/assets/solana', { 
      signal,
      headers: {
        'Accept': 'application/json',
      }
    })
    if (!res.ok) throw new Error(`CoinCap HTTP ${res.status}`)
    const data = await res.json() as { data?: { priceUsd?: string } }
    const price = data?.data?.priceUsd ? Number(data.data.priceUsd) : NaN
    if (!Number.isFinite(price) || price <= 0) throw new Error('CoinCap: Invalid price data')
    return price
  } catch (e) {
    console.warn('CoinCap fetch failed:', e)
    throw e
  }
}

async function fetchSolPrice(signal?: AbortSignal): Promise<number> {
  // Utiliser CryptoCompare - PAS DE FALLBACK
  try { 
    return await fetchFromCryptoCompare(signal)
  } catch (e) {
    console.error('❌ CryptoCompare API failed:', e)
    // Relancer l'erreur au lieu d'utiliser un fallback
    throw new Error(`CryptoCompare API failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
  }
}

export function useSolPrice(intervalMs = 60_000) {
  const [state, setState] = useState<SolPriceState>({ usd: null, lastUpdated: null, status: 'idle' })
  const timer = useRef<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    
    const load = async () => {
      try {
        console.log(`⏰ [${new Date().toLocaleTimeString()}] Updating SOL price from CryptoCompare...`)
        const usd = await fetchSolPrice(controller.signal)
        setState({ 
          usd, 
          lastUpdated: Date.now(), 
          status: 'ok' 
        })
        console.log(`✅ [${new Date().toLocaleTimeString()}] SOL price updated: $${usd.toFixed(2)}`)
      } catch (e) {
        console.error('❌ Failed to fetch SOL price from CryptoCompare:', e)
        // Ne pas utiliser de fallback - afficher l'erreur
        setState({ 
          usd: null, 
          lastUpdated: Date.now(), 
          status: 'error', 
          error: e instanceof Error ? e.message : 'CryptoCompare API failed' 
        })
        console.error('🚫 No fallback price used - CryptoCompare required!')
      }
    }
    
    // Charger immédiatement au démarrage
    load()
    
    // Programmer les mises à jour toutes les minutes (60 secondes)
    timer.current = window.setInterval(load, intervalMs)
    
    return () => {
      controller.abort()
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [intervalMs])

  return state
}