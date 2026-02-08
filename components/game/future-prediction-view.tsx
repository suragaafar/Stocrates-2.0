'use client'

import React, { useState, useEffect } from 'react'
import { useGame } from '@/lib/game/game-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generatePricePrediction, type PricePrediction } from '@/lib/stocks/price-predictor'
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Loader2, 
  AlertTriangle, 
  Search,
  Calendar,
  Target,
  Brain,
  Newspaper
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

export function FuturePredictionView() {
  const { gameState } = useGame()
  const [symbol, setSymbol] = useState('')
  const [currentPrice, setCurrentPrice] = useState('')
  const [prediction, setPrediction] = useState<PricePrediction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const futureDate = gameState.selectedDate
  const today = new Date()
  const daysInFuture = differenceInDays(futureDate, today)

  // Determine timeframe based on days in future
  const getTimeframe = (): '1day' | '1week' | '1month' => {
    if (daysInFuture <= 2) return '1day'
    if (daysInFuture <= 14) return '1week'
    return '1month'
  }

  const handleGeneratePrediction = async () => {
    if (!symbol.trim() || !currentPrice) {
      setError('Please enter both stock symbol and current price')
      return
    }

    const price = parseFloat(currentPrice)
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const timeframe = getTimeframe()
      const predictionResult = await generatePricePrediction(
        symbol.toUpperCase(),
        price,
        timeframe
      )
      setPrediction(predictionResult)
    } catch (err) {
      setError('Failed to generate prediction. Please try again.')
      console.error('Prediction error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGeneratePrediction()
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-purple-900 dark:text-purple-100">
            🔮 Future Price Prediction
          </h3>
        </div>
        <p className="text-xs text-purple-800 dark:text-purple-200">
          AI-powered predictions based on historical patterns and recent news analysis
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-500 rounded-lg p-3">
        <div className="flex items-center gap-2 text-red-900 dark:text-red-100 font-bold text-sm mb-1">
          <AlertTriangle className="h-5 w-5" />
          <span>⚠️ NOT FINANCIAL ADVICE</span>
        </div>
        <p className="text-xs text-red-800 dark:text-red-200">
          This is a fun educational tool for learning about market analysis. Predictions are based on AI analysis of news and historical patterns. <strong>DO NOT</strong> use these predictions for actual investment decisions!
        </p>
      </div>

      {/* Future Date Info */}
      <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-semibold">
            Predicting for: {format(futureDate, 'MMMM d, yyyy')}
          </span>
        </div>
        <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
          {daysInFuture} days from today ({getTimeframe()} prediction window)
        </p>
      </div>

      {/* Input Form */}
      <div className="space-y-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
            Stock Symbol
          </label>
          <Input
            type="text"
            placeholder="e.g., AAPL, NVDA, TSLA"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            className="uppercase"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
            Current Price ($)
          </label>
          <Input
            type="number"
            placeholder="e.g., 150.50"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            onKeyPress={handleKeyPress}
            step="0.01"
            min="0"
          />
        </div>

        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2 rounded">
            {error}
          </div>
        )}

        <Button
          onClick={handleGeneratePrediction}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Prediction...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Prediction
            </>
          )}
        </Button>
      </div>

      {/* Prediction Result */}
      {prediction && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Prediction */}
          <div className={`border-2 rounded-lg p-4 ${
            prediction.predictedChange >= 0
              ? 'bg-green-50 dark:bg-green-950/30 border-green-500'
              : 'bg-red-50 dark:bg-red-950/30 border-red-500'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {prediction.predictedChange >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              )}
              <h4 className="font-bold text-lg">
                {prediction.symbol} Prediction
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Current Price</p>
                <p className="text-2xl font-bold">${prediction.currentPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Predicted Price</p>
                <p className={`text-2xl font-bold ${
                  prediction.predictedChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${prediction.predictedPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${
              prediction.predictedChange >= 0
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Expected Change</span>
                <span className={`text-xl font-bold ${
                  prediction.predictedChange >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {prediction.predictedChange >= 0 ? '+' : ''}
                  {prediction.predictedChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Confidence Level */}
          <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold">Confidence Level</span>
            </div>
            <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  prediction.confidence >= 70
                    ? 'bg-green-500'
                    : prediction.confidence >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${prediction.confidence}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-right">
              {prediction.confidence}% confidence
            </p>
          </div>

          {/* AI Reasoning */}
          <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold">AI Analysis</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {prediction.reasoning}
            </p>
          </div>

          {/* Key Factors */}
          <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-3">
              <Newspaper className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-semibold">Key Factors</span>
            </div>
            <ul className="space-y-2">
              {prediction.newsFactors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Educational Note */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>💡 Learning Tip:</strong> This prediction combines historical pattern analysis with recent news sentiment. Real investors use similar methods but also consider many other factors like company fundamentals, market conditions, and economic indicators.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
