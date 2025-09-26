import { useState } from 'react'
import { Trade } from '../types/trades'
import { format, parseISO } from 'date-fns'
import { en } from 'date-fns/locale'

interface TradesTableProps {
  trades: Trade[]
}

export function TradesTable({ trades }: TradesTableProps) {
  const [sortField, setSortField] = useState<keyof Trade>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const sortedTrades = [...trades].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    // Tri spécial pour les dates
    if (sortField === 'date') {
      const aDate = new Date(aValue as string)
      const bDate = new Date(bValue as string)
      return sortDirection === 'asc' 
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime()
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })

  const totalPages = Math.ceil(sortedTrades.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTrades = sortedTrades.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: keyof Trade) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MM/dd/yyyy HH:mm', { locale: en })
  }

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-400'
    if (pnl < 0) return 'text-red-400'
    return 'text-white/70'
  }

  const getSideColor = (side: 'buy' | 'sell') => {
    return side === 'buy' ? 'text-green-400' : 'text-red-400'
  }

  return (
    <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Historique des Trades</h2>
        <div className="text-sm text-white/60">
          {trades.length} trade{trades.length > 1 ? 's' : ''}
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-8 text-white/60">
          Aucun trade trouvé
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th 
                    className="text-left py-3 px-2 cursor-pointer hover:text-white/80 transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-2 cursor-pointer hover:text-white/80 transition-colors"
                    onClick={() => handleSort('asset')}
                  >
                    Asset {sortField === 'asset' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-2 cursor-pointer hover:text-white/80 transition-colors"
                    onClick={() => handleSort('side')}
                  >
                    Type {sortField === 'side' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-right py-3 px-2 cursor-pointer hover:text-white/80 transition-colors"
                    onClick={() => handleSort('quantity')}
                  >
                    Quantité {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-right py-3 px-2 cursor-pointer hover:text-white/80 transition-colors"
                    onClick={() => handleSort('price')}
                  >
                    Prix {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-right py-3 px-2 cursor-pointer hover:text-white/80 transition-colors"
                    onClick={() => handleSort('total')}
                  >
                    Total {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-right py-3 px-2 cursor-pointer hover:text-white/80 transition-colors"
                    onClick={() => handleSort('fees')}
                  >
                    Fees {sortField === 'fees' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-right py-3 px-2 cursor-pointer hover:text-white/80 transition-colors"
                    onClick={() => handleSort('pnl')}
                  >
                    PnL {sortField === 'pnl' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedTrades.map((trade, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 text-sm">
                      {formatDate(trade.date)}
                    </td>
                    <td className="py-3 px-2 font-medium">
                      {trade.asset}
                    </td>
                    <td className={`py-3 px-2 font-medium ${getSideColor(trade.side)}`}>
                      {trade.side === 'buy' ? 'Achat' : 'Vente'}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {trade.quantity.toLocaleString('en-US')}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {formatCurrency(trade.price)}
                    </td>
                    <td className="py-3 px-2 text-right font-medium">
                      {formatCurrency(trade.total || 0)}
                    </td>
                    <td className="py-3 px-2 text-right text-white/60">
                      {formatCurrency(trade.fees)}
                    </td>
                    <td className={`py-3 px-2 text-right font-medium ${getPnLColor(trade.pnl || 0)}`}>
                      {trade.pnl ? formatCurrency(trade.pnl) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-white/60">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
