import { useState } from 'react'
import { ExportData } from '../utils/advancedAnalyzer'
import { ExportManager } from '../utils/exportUtils'

interface ExportPanelProps {
  data: ExportData
  onClose: () => void
}

export function ExportPanel({ data, onClose }: ExportPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'excel' | 'report'>('csv')
  const [selectedData, setSelectedData] = useState<'all' | 'trades' | 'summary' | 'insights' | 'monthly' | 'assets' | 'risk'>('all')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const timestamp = new Date().toISOString().split('T')[0]
      let content: string
      let filename: string
      let mimeType: string

      switch (selectedFormat) {
        case 'csv':
          if (selectedData === 'all') {
            content = ExportManager.exportToCSV(data, 'trades')
            filename = `mockape-analysis-${timestamp}.csv`
          } else {
            content = ExportManager.exportToCSV(data, selectedData)
            filename = `mockape-${selectedData}-${timestamp}.csv`
          }
          mimeType = 'text/csv'
          break

        case 'json':
          content = ExportManager.exportToJSON(data)
          filename = `mockape-analysis-${timestamp}.json`
          mimeType = 'application/json'
          break

        case 'excel':
          content = ExportManager.exportToCSV(data, 'trades')
          filename = `mockape-analysis-${timestamp}.csv`
          mimeType = 'text/csv'
          break

        case 'report':
          content = ExportManager.generateReport(data)
          filename = `mockape-report-${timestamp}.md`
          mimeType = 'text/markdown'
          break

        default:
          throw new Error('Unsupported format')
      }

      ExportManager.downloadFile(content, filename, mimeType)
      
      // Show success message
      setTimeout(() => {
        setIsExporting(false)
        onClose()
      }, 1000)

    } catch (error) {
      console.error('Export error:', error)
      setIsExporting(false)
    }
  }

  const getDataDescription = (dataType: string) => {
    const descriptions: { [key: string]: string } = {
      all: 'All data (trades, analyses, insights)',
      trades: 'Detail of all trades',
      summary: 'Summary of main statistics',
      insights: 'Advanced insights and recommendations',
      monthly: 'Monthly performance',
      assets: 'Performance by asset',
      risk: 'Detailed risk metrics'
    }
    return descriptions[dataType] || ''
  }

  const getFormatDescription = (format: string) => {
    const descriptions: { [key: string]: string } = {
      csv: 'Spreadsheet format compatible with Excel/Google Sheets',
      json: 'JSON format for integration with other tools',
      excel: 'CSV format optimized for Excel',
      report: 'Readable markdown report'
    }
    return descriptions[format] || ''
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">📊 Export Analysis</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white/80 transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Format selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Export format</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['csv', 'json', 'excel', 'report'] as const).map(format => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`p-3 rounded-xl border transition-colors ${
                    selectedFormat === format
                      ? 'border-[#14F195] bg-[#14F195]/10 text-[#14F195]'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">
                      {format === 'csv' && '📊'}
                      {format === 'json' && '🔧'}
                      {format === 'excel' && '📈'}
                      {format === 'report' && '📋'}
                    </div>
                    <div className="font-medium capitalize">{format}</div>
                    <div className="text-xs text-white/60 mt-1">
                      {getFormatDescription(format)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Data selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Data to export</h3>
            <div className="space-y-2">
              {([
                { key: 'all', label: 'All data', icon: '📊' },
                { key: 'trades', label: 'Trade details', icon: '💼' },
                { key: 'summary', label: 'Summary', icon: '📈' },
                { key: 'insights', label: 'Advanced insights', icon: '🧠' },
                { key: 'monthly', label: 'Monthly performance', icon: '📅' },
                { key: 'assets', label: 'Performance by asset', icon: '🎯' },
                { key: 'risk', label: 'Risk metrics', icon: '⚠️' }
              ] as const).map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedData(key)}
                  className={`w-full p-3 rounded-xl border transition-colors text-left ${
                    selectedData === key
                      ? 'border-[#14F195] bg-[#14F195]/10 text-[#14F195]'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-white/60">
                        {getDataDescription(key)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Data preview */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3">Data preview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">Trades:</span>
                <span className="ml-2 font-medium">{data.trades.length}</span>
              </div>
              <div>
                <span className="text-white/60">Total PnL:</span>
                <span className="ml-2 font-medium">{data.summary.totalPnL.toFixed(2)} SOL</span>
              </div>
              <div>
                <span className="text-white/60">Volume:</span>
                <span className="ml-2 font-medium">{data.summary.totalVolume.toFixed(2)} SOL</span>
              </div>
              <div>
                <span className="text-white/60">Win Rate:</span>
                <span className="ml-2 font-medium">{data.summary.winRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#14F195] to-[#00D18C] text-black font-semibold hover:from-[#12D885] hover:to-[#00C47A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Export...
                </div>
              ) : (
                'Export'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
