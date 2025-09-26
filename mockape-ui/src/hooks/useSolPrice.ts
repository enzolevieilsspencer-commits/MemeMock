import { useEffect, useRef, useState } from 'react'

type PriceState = { usd: number | null; status: 'idle' | 'loading' | 'ok' | 'error' }

export function useSolPrice(pollMs: number = 60000): PriceState {
  const [state, setState] = useState<PriceState>({ usd: null, status: 'idle' })
  const timer = useRef<number | null>(null)

  async function fetchPrice() {
    try {
      setState((s) => ({ ...s, status: 'loading' }))
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', { cache: 'no-store' })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const json = await res.json()
      const usd = json?.solana?.usd ?? null
      setState({ usd, status: usd != null ? 'ok' : 'error' })
    } catch {
      setState((s) => ({ ...s, status: 'error' }))
    }
  }

  useEffect(() => {
    void fetchPrice()
    timer.current = window.setInterval(fetchPrice, pollMs)
    return () => { if (timer.current) window.clearInterval(timer.current) }
  }, [pollMs])

  return state
}


