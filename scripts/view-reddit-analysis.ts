/**
 * View Reddit Analysis Results
 * Displays the analysis in a formatted way
 *
 * Run with: pnpm run view:analysis
 */

// Load environment variables from .env.local (not required for viewing, but good practice)
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { readFileSync } from 'fs'
import { join } from 'path'
import type { CombinedAnalysis } from '../lib/reddit/gpt-batch-analyzer'

function main() {
  console.log('📊 Reddit Analysis Viewer')
  console.log('=' .repeat(70))
  
  try {
    const analysisPath = join(process.cwd(), 'data', 'reddit-analysis.json')
    
    let analysis: CombinedAnalysis
    try {
      const rawData = readFileSync(analysisPath, 'utf-8')
      analysis = JSON.parse(rawData)
    } catch (error) {
      console.error('\n❌ Error: Could not find reddit-analysis.json')
      console.error('💡 Please run `pnpm run analyze:reddit` first')
      process.exit(1)
    }
    
    console.log(`\n📅 Analysis Date: ${new Date(analysis.analyzedAt).toLocaleString()}`)
    console.log(`📱 Subreddits: ${analysis.subreddits.map(s => `r/${s}`).join(', ')}`)
    console.log(`📊 Total Posts Analyzed: ${analysis.totalPosts}`)
    console.log(`📦 Total Batches: ${analysis.totalBatches}`)
    
    console.log('\n' + '=' .repeat(70))
    console.log('🎯 MARKET SENTIMENT')
    console.log('=' .repeat(70))
    
    const sentimentEmoji = analysis.overallSentiment === 'bullish' ? '🚀' :
                          analysis.overallSentiment === 'bearish' ? '📉' : '➡️'

    console.log(`\n${sentimentEmoji} Overall: ${analysis.overallSentiment.toUpperCase()}`)
    console.log(`🎯 Confidence: ${analysis.confidence}%`)

    // Create a visual confidence bar
    const barLength = 50
    const filledLength = Math.round((analysis.confidence / 100) * barLength)
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength)
    console.log(`   [${bar}] ${analysis.confidence}%`)

    // Show Fear & Greed Index if available
    if (analysis.fearGreedIndex !== undefined) {
      const fearGreedLabel =
        analysis.fearGreedIndex < 20 ? 'Extreme Fear 😱' :
        analysis.fearGreedIndex < 40 ? 'Fear 😰' :
        analysis.fearGreedIndex < 60 ? 'Neutral 😐' :
        analysis.fearGreedIndex < 80 ? 'Greed 🤑' :
        'Extreme Greed 🚀'

      console.log(`\n📊 Fear & Greed Index: ${analysis.fearGreedIndex}/100`)
      console.log(`   ${fearGreedLabel}`)

      // Visual bar for Fear & Greed
      const fgBarLength = 50
      const fgFilledLength = Math.round((analysis.fearGreedIndex / 100) * fgBarLength)
      const fgBar = '█'.repeat(fgFilledLength) + '░'.repeat(fgBarLength - fgFilledLength)
      console.log(`   [${fgBar}] ${analysis.fearGreedIndex}/100`)
    }

    // Show reasoning if available
    if (analysis.marketSentimentReasoning) {
      console.log(`\n💡 Market Sentiment Reasoning:`)
      console.log(`   ${analysis.marketSentimentReasoning}`)
    }
    
    console.log('\n' + '=' .repeat(70))
    console.log('🔥 TOP STOCKS')
    console.log('=' .repeat(70))
    
    analysis.topStocks.forEach((stock, i) => {
      const sentimentEmoji = stock.sentiment === 'bullish' ? '🚀' : 
                            stock.sentiment === 'bearish' ? '📉' : '➡️'
      
      console.log(`\n${i + 1}. ${sentimentEmoji} $${stock.symbol}`)
      console.log(`   ${'─'.repeat(60)}`)
      console.log(`   📊 Mentions: ${stock.mentions}`)
      console.log(`   💭 Sentiment: ${stock.sentiment.toUpperCase()}`)
      console.log(`   ⬆️  Avg Score: ${stock.avgScore.toLocaleString()} upvotes`)
      console.log(`   🎯 Confidence: ${stock.confidence}%`)
      
      if (stock.keyPoints.length > 0) {
        console.log(`   💡 Key Points:`)
        stock.keyPoints.forEach(point => {
          console.log(`      • ${point}`)
        })
      }
    })
    
    console.log('\n' + '=' .repeat(70))
    console.log('💡 KEY THEMES')
    console.log('=' .repeat(70))
    
    analysis.themes.forEach((theme, i) => {
      console.log(`\n${i + 1}. ${theme}`)
    })
    
    console.log('\n' + '=' .repeat(70))
    console.log('📝 EXECUTIVE SUMMARY')
    console.log('=' .repeat(70))
    
    console.log(`\n${analysis.summary}`)
    
    console.log('\n' + '=' .repeat(70))
    console.log('📈 QUICK STATS')
    console.log('=' .repeat(70))
    
    const bullishStocks = analysis.topStocks.filter(s => s.sentiment === 'bullish').length
    const bearishStocks = analysis.topStocks.filter(s => s.sentiment === 'bearish').length
    const neutralStocks = analysis.topStocks.filter(s => s.sentiment === 'neutral').length
    
    console.log(`\n🚀 Bullish stocks: ${bullishStocks}`)
    console.log(`📉 Bearish stocks: ${bearishStocks}`)
    console.log(`➡️  Neutral stocks: ${neutralStocks}`)
    
    const totalMentions = analysis.topStocks.reduce((sum, s) => sum + s.mentions, 0)
    console.log(`\n📊 Total stock mentions: ${totalMentions}`)
    
    if (analysis.topStocks.length > 0) {
      const avgConfidence = Math.round(
        analysis.topStocks.reduce((sum, s) => sum + s.confidence, 0) / analysis.topStocks.length
      )
      console.log(`🎯 Average confidence: ${avgConfidence}%`)
    }
    
    console.log('\n' + '=' .repeat(70))
    console.log('✅ Analysis viewing complete!')
    console.log('=' .repeat(70))
    
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

main()

