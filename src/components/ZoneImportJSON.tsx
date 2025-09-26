import { useState } from 'react'
import { motion } from 'framer-motion'
import { detectDataFormat } from '../utils/mockapeConverter'

export function ZoneImportJSON(props: { 
  onValidJSON: (text: string) => void; 
  onAnalyze?: () => void;
  isDataLoaded?: boolean;
}) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null)

  function handleAnalyze() {
    try {
      const parsed = JSON.parse(text)
      if (!parsed || (Array.isArray(parsed) && parsed.length === 0)) {
        throw new Error('Empty or invalid JSON')
      }

      // Detect data format
      const format = detectDataFormat(text)

      if (format === 'unknown') {
        throw new Error('Unrecognized format. Use standard trades format or MockApe format.')
      }

      if (format === 'mockape') {
        // Validation pour le format MockApe
        const requiredFields = ['pnlSol', 'solInvested', 'solReceived', 'timestamp', 'tokenName']
        const invalidEntries = []

        parsed.forEach((entry, index) => {
          const missingFields = requiredFields.filter(field => !(field in entry))
          if (missingFields.length > 0) {
            invalidEntries.push(`Entry ${index + 1}: missing fields (${missingFields.join(', ')})`)
          }

          if (entry.timestamp && (typeof entry.timestamp !== 'number' || entry.timestamp <= 0)) {
            invalidEntries.push(`Entry ${index + 1}: timestamp must be a positive number`)
          }

          if (entry.solInvested && (typeof entry.solInvested !== 'number' || entry.solInvested <= 0)) {
            invalidEntries.push(`Entry ${index + 1}: solInvested must be a positive number`)
          }
        })

        if (invalidEntries.length > 0) {
          throw new Error(`MockApe validation errors:\n${invalidEntries.slice(0, 5).join('\n')}${invalidEntries.length > 5 ? '\n...' : ''}`)
        }
      } else {
        // Validation pour le format de trades standard
        const requiredFields = ['date', 'asset', 'side', 'quantity', 'price']
        const invalidTrades = []

        parsed.forEach((trade, index) => {
          const missingFields = requiredFields.filter(field => !(field in trade))
          if (missingFields.length > 0) {
            invalidTrades.push(`Trade ${index + 1}: missing fields (${missingFields.join(', ')})`)
          }

          if (trade.side && !['buy', 'sell'].includes(trade.side)) {
            invalidTrades.push(`Trade ${index + 1}: side must be 'buy' or 'sell'`)
          }

          if (trade.quantity && (typeof trade.quantity !== 'number' || trade.quantity <= 0)) {
            invalidTrades.push(`Trade ${index + 1}: quantity must be a positive number`)
          }

          if (trade.price && (typeof trade.price !== 'number' || trade.price <= 0)) {
            invalidTrades.push(`Trade ${index + 1}: price must be a positive number`)
          }
        })

        if (invalidTrades.length > 0) {
          throw new Error(`Validation errors:\n${invalidTrades.slice(0, 5).join('\n')}${invalidTrades.length > 5 ? '\n...' : ''}`)
        }
      }

            // Valider et passer les données à l'onglet Analyse
            props.onValidJSON(text)
            setError(null)
            // Appeler la fonction onAnalyze si elle existe
            if (props.onAnalyze) {
              props.onAnalyze()
            }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The provided text is not valid JSON.')
    }
  }

  return (
    <motion.div 
      className="rounded-3xl bg-white/5 backdrop-blur-sm border border-white/20 p-6 card-smooth"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <h2 className="text-2xl font-bold mb-4">
        📊 Data Import
      </h2>
      
      {props.isDataLoaded && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-300 text-sm">
            ✅ Data loaded from your previous session
          </p>
        </div>
      )}
      
      <motion.textarea
        className="w-full h-32 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/20 p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#9945FF] focus:border-transparent resize-none font-mono text-sm input-smooth"
        placeholder="Paste your JSON here..."
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          if (e.target.value.trim()) {
            const format = detectDataFormat(e.target.value)
            setDetectedFormat(format === 'trades' ? 'Standard Trades Format' : format === 'mockape' ? 'MockApe Format' : 'Unrecognized Format')
          } else {
            setDetectedFormat(null)
          }
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      />
      
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        {detectedFormat && (
          <motion.div 
            className="mt-4 text-sm bg-white/5 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-white/70">Detected format: </span>
            <span className={`font-semibold ${detectedFormat.includes('Unrecognized') ? 'text-red-400' : 'text-green-400'}`}>
              {detectedFormat}
            </span>
          </motion.div>
        )}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        {error && (
          <motion.div 
            className="mt-4 p-4 bg-white/5 backdrop-blur-sm border border-red-500/30 rounded-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-sm text-red-300 whitespace-pre-line">{error}</p>
          </motion.div>
        )}
      </motion.div>
      
      <motion.div 
        className="mt-4 flex gap-4 flex-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <motion.button 
          onClick={handleAnalyze} 
          className="btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          📊 Analyze Data
        </motion.button>
        
        <motion.button 
          onClick={() => navigator.clipboard.readText().then(t => setText(t)).catch(() => setError('Unable to read clipboard'))} 
          className="btn-secondary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          📋 Paste
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
