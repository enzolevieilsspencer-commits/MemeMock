import { useEffect, useState } from 'react'
import './index.css'

type TabKey = 'charts' | 'calendar'

function Header({ solPrice, status }: { solPrice: number | null; status: 'ok' | 'error' | 'loading' }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between px-6 py-4 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-[--color-solana-purple]/20 flex items-center justify-center">
          <span className="text-xl">📊</span>
        </div>
        <h1 className="text-xl font-semibold tracking-wide">MockApe ANALYTICS</h1>
      </div>
      <div className="text-sm">
        <span className="opacity-70 mr-2">SOL</span>
        {status === 'loading' && <span className="opacity-70">chargement…</span>}
        {status === 'error' && <span className="text-red-400">n/a</span>}
        {status === 'ok' && <span className="text-[--color-solana-green] font-medium">${'{'}solPrice?.toFixed(2){'}'}</span>}
      </div>
    </header>
  )
}

function Tabs({ current, onChange }: { current: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <div className="glass-card mx-auto mt-28 w-full max-w-5xl p-2 flex gap-2">
      {(
        [
          { key: 'charts', label: 'Graphiques' },
          { key: 'calendar', label: 'Calendrier' },
        ] as { key: TabKey; label: string }[]
      ).map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={
            'flex-1 rounded-xl px-4 py-2 transition ' +
            (current === t.key
              ? 'bg-white/10 text-white shadow'
              : 'text-white/70 hover:text-white hover:bg-white/5')
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function ZoneImportJSON({ onValid }: { onValid: (text: string) => void }) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  function validate() {
    try {
      JSON.parse(text)
      setError(null)
      onValid(text)
    } catch (e) {
      setError("Le contenu n'est pas un JSON valide.")
    }
  }

  return (
    <div className="glass-card mx-auto mt-6 w-full max-w-5xl p-4">
      <label className="mb-2 block text-sm opacity-80">Coller votre texte JSON</label>
      <textarea
        className="h-40 w-full rounded-xl bg-black/40 p-3 outline-none ring-1 ring-white/10 focus:ring-[--color-solana-teal]"
        placeholder="Collez votre contenu JSON ici…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <button onClick={validate} className="mt-4 w-full rounded-xl bg-[--color-solana-teal] px-4 py-2 text-black font-medium">
        Analyser
      </button>
    </div>
  )
}

function VueGraphiques() {
  return (
    <div className="mx-auto mt-6 w-full max-w-5xl">
      <div className="glass-card p-6 text-white/80">Graphiques à venir…</div>
    </div>
  )
}

function VueCalendrier() {
  return (
    <div className="mx-auto mt-6 w-full max-w-5xl">
      <div className="glass-card p-6 text-white/80">Calendrier à venir…</div>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<TabKey>('charts')
  const [solPrice, setSolPrice] = useState<number | null>(null)
  const [priceStatus, setPriceStatus] = useState<'ok' | 'error' | 'loading'>('loading')

  useEffect(() => {
    let timer: number | undefined
    async function fetchPrice() {
      try {
        setPriceStatus('loading')
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', { cache: 'no-store' })
        if (!res.ok) throw new Error('http')
        const data = await res.json()
        const p = data?.solana?.usd
        if (typeof p === 'number') {
          setSolPrice(p)
          setPriceStatus('ok')
        } else {
          setPriceStatus('error')
        }
      } catch (e) {
        setPriceStatus('error')
      }
    }
    fetchPrice()
    timer = window.setInterval(fetchPrice, 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="pb-20">
      <Header solPrice={solPrice} status={priceStatus} />
      <div className="mt-24 text-center">
        <h2 className="text-3xl font-semibold">MockApe ANALYTICS</h2>
        <p className="mt-2 opacity-70">Analysez les trades, visualisez un aperçu et explorez les détails.</p>
      </div>
      <Tabs current={tab} onChange={setTab} />
      <ZoneImportJSON onValid={() => {}} />
      {tab === 'charts' ? <VueGraphiques /> : <VueCalendrier />}
    </div>
  )
}
