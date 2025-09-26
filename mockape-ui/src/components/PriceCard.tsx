import { motion } from 'framer-motion'

export function PriceCard(props: { label?: string; value?: number | null; status: 'idle' | 'loading' | 'ok' | 'error' }) {
  const { label = 'SOL / USD', value, status } = props
  const display = status === 'ok' && value != null ? `$${value.toFixed(2)}` : status === 'loading' ? 'Chargement…' : 'n/a'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-4 border border-white/10 bg-white/5 w-56 shadow-[0_10px_40px_rgba(139,92,246,0.15)]"
    >
      <div className="text-sm text-white/60">{label}</div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#06B6D4] to-[#10B981]">
        {display}
      </div>
    </motion.div>
  )
}


