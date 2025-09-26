import { motion } from 'framer-motion'
import './index.css'
import { useSolPrice } from './hooks/useSolPrice'
import { PriceCard } from './components/PriceCard'
import { JsonInputCard } from './components/JsonInputCard'

function BackgroundFX() {
  const colors = ['#8B5CF6', '#06B6D4', '#10B981']
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <motion.div className="absolute inset-0" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1.2}} style={{
        background:
          'radial-gradient(1200px 600px at 10% 10%, rgba(139,92,246,0.25), transparent),'+
          'radial-gradient(1000px 500px at 90% 20%, rgba(6,182,212,0.25), transparent),'+
          'radial-gradient(900px 600px at 50% 90%, rgba(16,185,129,0.25), transparent)'
      }} />
      <motion.div className="absolute -inset-[20%]" initial={{scale:1.1, rotate:0}} animate={{scale:1.15, rotate:360}} transition={{repeat:Infinity, duration:40, ease:'linear'}} style={{
        background:'conic-gradient(from 90deg at 50% 50%, rgba(139,92,246,0.15), rgba(6,182,212,0.15), rgba(16,185,129,0.15), rgba(139,92,246,0.15))',
        filter:'blur(80px)'
      }}/>
      {Array.from({length:40}).map((_,i)=> (
        <motion.span key={i} className="absolute block h-[2px] w-[2px] rounded-full shadow-[0_0_15px_currentColor]" style={{color:colors[i%colors.length]}}
          initial={{opacity:0, x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight}}
          animate={{opacity:[0.3,0.8,0.3], x:[null as unknown as number, Math.random()*window.innerWidth], y:[null as unknown as number, Math.random()*window.innerHeight]}}
          transition={{duration:10+Math.random()*10, repeat:Infinity, ease:'easeInOut'}}/>
      ))}
      <div className="absolute inset-0 backdrop-blur-3xl opacity-40" />
    </div>
  )
}

export default function App() {
  const price = useSolPrice(60000)
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <BackgroundFX />
      <header className="relative z-10 mx-auto max-w-6xl px-4 pt-20 pb-10 text-center">
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.8}}>
          <motion.div className="mx-auto mb-6 h-16 w-16 rounded-3xl bg-gradient-to-br from-[var(--violet)] via-[var(--cyan)] to-[var(--green)] shadow-[0_0_40px_rgba(139,92,246,0.6)]" initial={{scale:0.9}} animate={{scale:[0.95,1,0.95]}} transition={{repeat:Infinity, duration:4}}/>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--violet)] via-[var(--cyan)] to-[var(--green)]">MockApe</span>
          </h1>
          <div className="mt-2 text-white/60 tracking-[0.4em]">ANALYTICS</div>
          <p className="mt-4 text-white/80 max-w-3xl mx-auto">
            Analysez les trades, visualisez votre portefeuille en copiant la data des trades MockApe
          </p>
          <div className="mx-auto mt-8 h-px w-40 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </motion.div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16 space-y-6">
        <div className="flex justify-end">
          <PriceCard value={price.usd} status={price.status} />
        </div>
        <JsonInputCard />
      </main>
    </div>
  )
}
