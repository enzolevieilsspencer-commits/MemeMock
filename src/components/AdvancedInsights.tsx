import { AdvancedInsights as AdvancedInsightsType } from '../utils/advancedAnalyzer'

interface AdvancedInsightsProps {
  insights: AdvancedInsightsType
}

export function AdvancedInsights({ insights }: AdvancedInsightsProps) {
  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-red-400'
    if (score > 40) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getRiskLabel = (score: number) => {
    if (score > 70) return 'ÉLEVÉ'
    if (score > 40) return 'MODÉRÉ'
    return 'FAIBLE'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return '📈'
      case 'bearish': return '📉'
      default: return '➡️'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-400'
      case 'bearish': return 'text-red-400'
      default: return 'text-white/70'
    }
  }

  return (
    <div className="space-y-6">
      {/* Métriques de Performance */}
      <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
        <h2 className="text-xl font-semibold mb-4">📊 Métriques de Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Ratio de Sharpe</div>
            <div className="text-2xl font-bold text-white">
              {insights.sharpeRatio.toFixed(3)}
            </div>
            <div className="text-xs text-white/60 mt-1">
              {insights.sharpeRatio > 1 ? 'Excellent' : insights.sharpeRatio > 0.5 ? 'Bon' : 'À améliorer'}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Drawdown Max</div>
            <div className="text-2xl font-bold text-red-400">
              {insights.maxDrawdown.toFixed(2)} SOL
            </div>
            <div className="text-xs text-white/60 mt-1">
              Perte maximale
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Volatilité</div>
            <div className="text-2xl font-bold text-yellow-400">
              {insights.volatility.toFixed(4)}
            </div>
            <div className="text-xs text-white/60 mt-1">
              Variabilité des rendements
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Série de Gains</div>
            <div className="text-2xl font-bold text-green-400">
              {insights.winStreak}
            </div>
            <div className="text-xs text-white/60 mt-1">
              Trades gagnants consécutifs
            </div>
          </div>
        </div>
      </div>

      {/* Analyse de Risque */}
      <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
        <h2 className="text-xl font-semibold mb-4">⚠️ Analyse de Risque</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Score de Risque</div>
            <div className={`text-3xl font-bold ${getRiskColor(insights.riskScore)}`}>
              {insights.riskScore.toFixed(1)}/100
            </div>
            <div className={`text-sm font-medium ${getRiskColor(insights.riskScore)} mt-1`}>
              {getRiskLabel(insights.riskScore)}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Diversification</div>
            <div className="text-3xl font-bold text-white">
              {insights.diversificationScore.toFixed(1)}/100
            </div>
            <div className="text-sm text-white/60 mt-1">
              {insights.diversificationScore > 70 ? 'Bien diversifié' : 'À diversifier'}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Concentration</div>
            <div className="text-3xl font-bold text-white">
              {insights.concentrationRisk.toFixed(1)}%
            </div>
            <div className="text-sm text-white/60 mt-1">
              {insights.concentrationRisk > 80 ? 'Trop concentré' : 'Acceptable'}
            </div>
          </div>
        </div>
      </div>

      {/* Tendances et Prédictions */}
      <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
        <h2 className="text-xl font-semibold mb-4">📈 Tendances et Prédictions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Direction de Tendance</div>
            <div className={`text-2xl font-bold ${getTrendColor(insights.trendDirection)}`}>
              {getTrendIcon(insights.trendDirection)} {insights.trendDirection.toUpperCase()}
            </div>
            <div className="text-xs text-white/60 mt-1">
              {insights.trendDirection === 'bullish' && 'Tendance haussière détectée'}
              {insights.trendDirection === 'bearish' && 'Tendance baissière détectée'}
              {insights.trendDirection === 'neutral' && 'Tendance neutre'}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Score de Momentum</div>
            <div className={`text-2xl font-bold ${insights.momentumScore > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {insights.momentumScore > 0 ? '+' : ''}{insights.momentumScore.toFixed(3)}
            </div>
            <div className="text-xs text-white/60 mt-1">
              {insights.momentumScore > 0 ? 'Momentum positif' : 'Momentum négatif'}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Volatilité Prévue</div>
            <div className="text-2xl font-bold text-yellow-400">
              {insights.volatilityForecast.toFixed(4)}
            </div>
            <div className="text-xs text-white/60 mt-1">
              Prévision à court terme
            </div>
          </div>
        </div>
      </div>

      {/* Métriques Avancées */}
      <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
        <h2 className="text-xl font-semibold mb-4">🔬 Métriques Avancées</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Ratio Calmar</div>
            <div className="text-xl font-bold text-white">
              {insights.calmarRatio.toFixed(3)}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Ratio Sortino</div>
            <div className="text-xl font-bold text-white">
              {insights.sortinoRatio.toFixed(3)}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">VaR 95%</div>
            <div className="text-xl font-bold text-red-400">
              {insights.var95.toFixed(2)} SOL
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Expected Shortfall</div>
            <div className="text-xl font-bold text-red-400">
              {insights.expectedShortfall.toFixed(2)} SOL
            </div>
          </div>
        </div>
      </div>

      {/* Recommandations et Avertissements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommandations */}
        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">💡 Recommandations</h2>
          <div className="space-y-3">
            {insights.recommendations.length > 0 ? (
              insights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                  <span className="text-green-400 text-lg">💡</span>
                  <span className="text-white/80 text-sm">{recommendation}</span>
                </div>
              ))
            ) : (
              <div className="text-white/60 text-sm">Aucune recommandation spécifique</div>
            )}
          </div>
        </div>

        {/* Avertissements */}
        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">⚠️ Avertissements</h2>
          <div className="space-y-3">
            {insights.riskWarnings.length > 0 ? (
              insights.riskWarnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <span className="text-red-400 text-lg">⚠️</span>
                  <span className="text-white/80 text-sm">{warning}</span>
                </div>
              ))
            ) : (
              <div className="text-white/60 text-sm">Aucun avertissement majeur</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
