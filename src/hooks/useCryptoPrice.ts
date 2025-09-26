import { useEffect, useRef, useState } from 'react'

export type CryptoPriceState = {
  usd: number | null
  lastUpdated: number | null
  status: 'idle' | 'ok' | 'error'
  error?: string
}

async function fetchFromCryptoCompare(symbol: string, signal?: AbortSignal): Promise<number> {
  try {
    console.log(`🔄 Fetching ${symbol} price from CryptoCompare...`)
    
    // API CryptoCompare pour SYMBOL/USD
    const endpoint = `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`
    
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
    
    const data = await res.json()
    console.log(`✅ ${symbol} price fetched:`, data)
    
    if (typeof data.USD !== 'number') {
      throw new Error(`Invalid ${symbol} price format: ${JSON.stringify(data)}`)
    }
    
    return data.USD
  } catch (err) {
    console.error(`❌ CryptoCompare API failed for ${symbol}:`, err)
    throw err
  }
}

export function useCryptoPrice(intervalMs: number, symbol: string = 'SOL'): CryptoPriceState {
  const [state, setState] = useState<CryptoPriceState>({
    usd: null,
    lastUpdated: null,
    status: 'idle'
  })
  
  const abortRef = useRef<AbortController | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchPrice = async (signal?: AbortSignal) => {
    try {
      setState(prev => ({ ...prev, status: 'idle' }))
      const usd = await fetchFromCryptoCompare(symbol, signal)
      setState({
        usd,
        lastUpdated: Date.now(),
        status: 'ok'
      })
    } catch (err) {
      if (signal?.aborted) return
      setState({
        usd: null,
        lastUpdated: null,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }
  }

  useEffect(() => {
    // Fetch immédiat
    abortRef.current = new AbortController()
    fetchPrice(abortRef.current.signal)

    // Puis à intervalles réguliers
    intervalRef.current = setInterval(() => {
      abortRef.current = new AbortController()
      fetchPrice(abortRef.current.signal)
    }, intervalMs)

    return () => {
      if (abortRef.current) {
        abortRef.current.abort()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [intervalMs, symbol])

  return state
}
