import { useState } from 'react'
import { motion } from 'framer-motion'

export function JsonInputCard(props: { onValidJSON?: (json: unknown) => void }) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  function analyze() {
    try {
      const parsed = JSON.parse(text)
      setError(null)
      props.onValidJSON?.(parsed)
    } catch (e) {
      setError('JSON invalide. Vérifiez la structure.')
    }
  }

  async function pasteFromClipboard() {
    try {
      const t = await navigator.clipboard.readText()
      setText(t)
    } catch {
      setError('Impossible de lire le presse‑papiers')
    }
  }

  function fillExample() {
    setText(example)
    setError(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-6 border border-white/10 bg-white/5"
    >
      <h2 className="text-lg font-semibold mb-3">Zone d’import JSON</h2>
      <textarea
        className="w-full h-44 rounded-2xl bg-black/40 border border-white/10 p-4 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
        placeholder="Collez votre JSON ici..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={analyze} className="rounded-2xl px-4 py-2 bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-black font-semibold">Analyser</button>
        <button onClick={pasteFromClipboard} className="rounded-2xl px-4 py-2 bg-white/10">Coller</button>
        <button onClick={fillExample} className="rounded-2xl px-4 py-2 bg-white/10">Exemple</button>
      </div>
    </motion.div>
  )
}

const example = `[
  {"date":"2025-01-01T09:00:00Z","asset":"SOL","side":"buy","quantity":2,"price":100,"fees":0.1},
  {"date":"2025-01-01T11:00:00Z","asset":"SOL","side":"sell","quantity":1,"price":120,"fees":0.1}
]`








