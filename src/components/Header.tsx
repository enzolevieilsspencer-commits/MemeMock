import { motion } from 'framer-motion'
import { TabKey } from './Tabs'
// Import the monkey logo image from assets
import monkeyLogo from '../assets/logo.png'

interface HeaderProps {
  active: TabKey | null
}

export function Header({ 
  active
}: HeaderProps) {


  return (
    <header className="relative z-10">



      <div className="mx-auto max-w-6xl px-4 pt-16 pb-10">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto text-center"
        >
          {/* Futuristic Logo Area */}
          <motion.div 
            className="relative mx-auto mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          >
            {/* Cyberpunk-style container - Increased size for better quality */}
            <div className="relative w-40 h-40 mx-auto">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9945FF] via-[#06B6D4] to-[#14F195] p-1 animate-spin-slow">
                <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-sm"></div>
              </div>
              
              {/* Inner container with monkey logo */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur-md border border-white/10 overflow-hidden">
                <img 
                  src={monkeyLogo} 
                  alt="MemeMock Logo" 
                  className="w-full h-full rounded-full object-cover high-quality-image"
                  style={{
                    transform: 'scale(1.1)',
                    filter: 'contrast(1.1) saturate(1.2) brightness(1.05)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                  onError={(e) => {
                    // Fallback to a placeholder if image doesn't exist
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling.style.display = 'flex'
                  }}
                />
                {/* Fallback placeholder */}
                <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-[#06B6D4] to-[#14F195] hidden">
                  <div className="text-center text-white">
                    <div className="text-3xl mb-2">🐵</div>
                    <div className="text-xs font-mono">MOCKAPE</div>
                  </div>
                </div>
              </div>
              
              {/* Floating particles */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-[#14F195] rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-[#9945FF] rounded-full animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 -left-4 w-1 h-1 bg-[#06B6D4] rounded-full animate-pulse delay-500"></div>
            </div>
          </motion.div>

          {/* Futuristic Title */}
          <motion.h1 
            className="text-6xl sm:text-7xl font-bold font-inter relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-[#14F195] via-[#06B6D4] to-[#9945FF] bg-clip-text text-transparent animate-gradient-x">
              MemeMock
            </span>
            {/* Glitch effect overlay */}
            <span className="absolute inset-0 bg-gradient-to-r from-[#14F195] via-[#06B6D4] to-[#9945FF] bg-clip-text text-transparent opacity-0 animate-glitch">
              MemeMock
            </span>
          </motion.h1>
          
          {/* Futuristic divider */}
          <motion.div 
            className="relative mx-auto mt-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
          >
            <div className="h-px w-80 bg-gradient-to-r from-transparent via-[#14F195]/60 to-transparent"></div>
            <div className="absolute inset-0 h-px w-80 bg-gradient-to-r from-transparent via-[#06B6D4]/40 to-transparent animate-pulse"></div>
          </motion.div>
          
          {/* Futuristic subtitle */}
          <motion.div 
            className="mt-4 relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="text-white/90 tracking-[0.4em] text-xl font-semibold font-mono relative">
              <span className="bg-gradient-to-r from-[#14F195] to-[#06B6D4] bg-clip-text text-transparent">
                ANALYTICS
              </span>
              {/* Scanning line effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-0 animate-scan"></div>
            </div>
          </motion.div>
        </motion.div>
      </div>

    </header>
  )
}