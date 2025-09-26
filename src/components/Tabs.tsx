import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export type TabKey = 'graphs' | 'analysis' | 'calendar' | 'perpetuals'

export function Tabs(props: {
  active: TabKey | null
  onChange: (key: TabKey) => void
  items: { key: TabKey; label: string; icon?: ReactNode }[]
}) {
  const { active, onChange, items } = props
  return (
    <nav className="mb-6 inline-flex rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-1">
      {items.map((t, index) => (
        <motion.button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`
            relative px-8 py-4 text-base font-semibold transition-all duration-300 rounded-xl overflow-hidden
            ${active === t.key 
              ? 'text-white bg-gradient-to-r from-[#9945FF]/20 to-[#06B6D4]/20 shadow-lg' 
              : 'text-white/70 hover:text-white hover:bg-white/5'
            }
          `}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {active === t.key && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#9945FF]/30 to-[#06B6D4]/30 rounded-xl"
              layoutId="activeTab"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{t.label}</span>
        </motion.button>
      ))}
    </nav>
  )
}