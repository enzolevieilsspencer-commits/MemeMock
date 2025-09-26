import { useCryptoPrices } from '../hooks/useCryptoPrices'
import { motion } from 'framer-motion'
// Import crypto logos
import bitcoinLogo from '../assets/logo-btc.png'
import ethereumLogo from '../assets/logo-eth.png'
import solanaLogo from '../assets/logo-solana.png'

interface FixedTaskbarProps {
  onCryptoClick: (symbol: 'BTC' | 'ETH' | 'SOL') => void
}

export function FixedTaskbar({ onCryptoClick }: FixedTaskbarProps) {
  const { prices, isLoading } = useCryptoPrices()

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'BTC') {
      return `$${price.toFixed(0)}`
    } else if (symbol === 'ETH') {
      return `$${price.toFixed(0)}`
    } else {
      return `$${price.toFixed(2)}`
    }
  }

  const getStatusColor = (change24h: number, symbol: string) => {
    if (change24h >= 0) {
      // Couleurs spécifiques par crypto pour les gains
      switch (symbol) {
        case 'BTC': return 'text-orange-400'
        case 'ETH': return 'text-blue-400'
        case 'SOL': return 'text-green-400'
        default: return 'text-green-400'
      }
    } else {
      return 'text-red-400'
    }
  }

  const getStatusText = (price: number, symbol: string) => {
    if (isLoading) return '...'
    if (price === 0) return '...'
    return formatPrice(price, symbol)
  }

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-gray-800"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex items-center justify-start pl-12 pr-4 py-1.5 h-8 gap-4">
        {/* BTC */}
        <motion.div 
          className="flex items-center gap-1 cursor-pointer group relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          onClick={() => onCryptoClick('BTC')}
          title="Click to view Bitcoin chart"
        >
          <motion.div 
            className="w-4 h-4 rounded-full overflow-hidden group-hover:scale-110 transition-transform"
            style={{ backgroundColor: '#f7931a' }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <img 
              src={bitcoinLogo} 
              alt="Bitcoin" 
              className="w-full h-full object-contain p-0.5"
              onLoad={() => console.log('Bitcoin logo loaded successfully')}
              onError={(e) => {
                console.log('Bitcoin logo failed to load, using fallback')
                // Fallback to original design if image fails to load
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.className = 'w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center group-hover:bg-orange-400 transition-colors'
                  parent.innerHTML = '<span class="text-white text-[8px] font-bold">₿</span>'
                }
              }}
            />
          </motion.div>
          <motion.span 
            className={`text-xs font-semibold ${getStatusColor(prices.BTC.change24h, 'BTC')} group-hover:text-orange-300 transition-colors`}
            key={prices.BTC.price}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {getStatusText(prices.BTC.price, 'BTC')}
          </motion.span>
        </motion.div>

        {/* ETH */}
        <motion.div 
          className="flex items-center gap-1 cursor-pointer group relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4, duration: 0.4 }}
          onClick={() => onCryptoClick('ETH')}
          title="Click to view Ethereum chart"
        >
          <motion.div 
            className="w-4 h-4 rounded-full overflow-hidden group-hover:scale-110 transition-transform"
            style={{ backgroundColor: '#627eea' }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <img 
              src={ethereumLogo} 
              alt="Ethereum" 
              className="w-full h-full object-contain p-0.5"
              onLoad={() => console.log('Ethereum logo loaded successfully')}
              onError={(e) => {
                console.log('Ethereum logo failed to load, using fallback')
                // Fallback to original SVG if image fails to load
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.className = 'w-4 h-4 flex items-center justify-center group-hover:scale-110 transition-transform'
                  parent.innerHTML = `
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#627EEA"/>
                      <path d="M12.498 3v6.87l5.755 2.55-5.755-9.42z" fill="#FFFFFF" fillOpacity="0.602"/>
                      <path d="M12.498 3L6.742 12.42l5.756-2.55V3z" fill="#FFFFFF"/>
                      <path d="M12.498 16.969v4.03L18.258 14.01l-5.76 2.959z" fill="#FFFFFF" fillOpacity="0.602"/>
                      <path d="M12.498 20.999v-4.03l-5.756-2.959 5.756 6.989z" fill="#FFFFFF"/>
                      <path d="M12.498 15.429l5.755-3.009-5.755-2.55v5.559z" fill="#FFFFFF" fillOpacity="0.2"/>
                      <path d="M6.742 12.42l5.756 3.009v-5.559l-5.756 2.55z" fill="#FFFFFF" fillOpacity="0.602"/>
                    </svg>
                  `
                }
              }}
            />
          </motion.div>
          <motion.span 
            className={`text-xs font-semibold ${getStatusColor(prices.ETH.change24h, 'ETH')} group-hover:text-blue-300 transition-colors`}
            key={prices.ETH.price}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {getStatusText(prices.ETH.price, 'ETH')}
          </motion.span>
        </motion.div>

        {/* SOL */}
        <motion.div 
          className="flex items-center gap-1 cursor-pointer group relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6, duration: 0.4 }}
          onClick={() => onCryptoClick('SOL')}
          title="Click to view Solana chart"
        >
          <motion.div 
            className="w-4 h-4 rounded-full overflow-hidden group-hover:scale-110 transition-transform bg-black"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <img 
              src={solanaLogo} 
              alt="Solana" 
              className="w-full h-full object-contain p-0.5 solana-logo"
              style={{
                backgroundColor: 'transparent',
                filter: 'contrast(1.2) saturate(1.1) brightness(1.3)',
                background: 'transparent'
              }}
              onLoad={() => console.log('Solana logo loaded successfully')}
              onError={(e) => {
                console.log('Solana logo failed to load, using fallback')
                // Fallback to original SVG if image fails to load
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.className = 'w-4 h-4 flex items-center justify-center group-hover:scale-110 transition-transform'
                  parent.innerHTML = `
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.5" y="2" width="11" height="2.5" rx="0.5" fill="url(#sol-gradient-1)"/>
                      <rect x="0.5" y="5" width="11" height="2.5" rx="0.5" fill="url(#sol-gradient-2)"/>
                      <rect x="0.5" y="8" width="11" height="2.5" rx="0.5" fill="url(#sol-gradient-3)"/>
                      <defs>
                        <linearGradient id="sol-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#9945FF"/>
                          <stop offset="100%" stopColor="#14F195"/>
                        </linearGradient>
                        <linearGradient id="sol-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#9945FF"/>
                          <stop offset="100%" stopColor="#14F195"/>
                        </linearGradient>
                        <linearGradient id="sol-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#9945FF"/>
                          <stop offset="100%" stopColor="#14F195"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  `
                }
              }}
            />
          </motion.div>
          <motion.span 
            className={`text-xs font-semibold ${getStatusColor(prices.SOL.change24h, 'SOL')} group-hover:text-green-300 transition-colors`}
            key={prices.SOL.price}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {getStatusText(prices.SOL.price, 'SOL')}
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  )
}
