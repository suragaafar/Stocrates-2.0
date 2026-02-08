/**
 * Analyze Reddit Posts with GPT-4 in Batches
 * Processes scraped Reddit data in batches of 30 posts
 *
 * Run with: pnpm run analyze:reddit
 */

// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { analyzeAllBatches } from '../lib/reddit/gpt-batch-analyzer'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { SubredditData } from '../lib/reddit/multi-subreddit-scraper'

async function main() {
  console.log('🤖 Reddit GPT-4 Batch Analyzer')
  console.log('=' .repeat(70))

  // Verify API key is loaded
  if (!process.env.GROQ_API_KEY) {
    console.error('\n❌ Error: GROQ_API_KEY not found in .env.local')
    console.error('💡 Please make sure .env.local exists and contains:')
    console.error('   GROQ_API_KEY=your_key_here')
    process.exit(1)
  }

  console.log('✅ Groq API key loaded')

  try {
    // Load scraped data
    const dataPath = join(process.cwd(), 'data', 'reddit-raw.json')
    
    console.log(`\n📂 Loading data from: ${dataPath}`)
    
    let subredditData: SubredditData[]
    try {
      const rawData = readFileSync(dataPath, 'utf-8')
      subredditData = JSON.parse(rawData)
    } catch (error) {
      console.error('\n❌ Error: Could not find reddit-raw.json')
      console.error('💡 Please run `pnpm run scrape:reddit` first to scrape the data')
      process.exit(1)
    }
    
    console.log(`✅ Loaded data from ${subredditData.length} subreddit(s)`)
    
    const totalPosts = subredditData.reduce((sum, data) => sum + data.totalPosts, 0)
    console.log(`📊 Total posts to analyze: ${totalPosts}`)
    
    // Analyze in batches
    const batchSize = 30
    console.log(`📦 Batch size: ${batchSize} posts per batch`)
    console.log(`🧠 Enhanced stock detection: ENABLED (will find ALL company mentions)`)
    console.log(`🎯 Advanced sentiment analysis: ENABLED (understands context, sarcasm, WSB slang)`)

    const analysis = await analyzeAllBatches(subredditData, batchSize, true, true)
    
    // Save analysis results
    const outputPath = join(process.cwd(), 'data', 'reddit-analysis.json')
    writeFileSync(outputPath, JSON.stringify(analysis, null, 2))
    
    console.log(`\n💾 Saved analysis to: ${outputPath}`)
    
    // Display results
    console.log('\n' + '=' .repeat(70))
    console.log('📊 ANALYSIS RESULTS')
    console.log('=' .repeat(70))
    
    console.log(`\n📈 Overall Sentiment: ${analysis.overallSentiment.toUpperCase()}`)
    console.log(`🎯 Confidence: ${analysis.confidence}%`)

    if (analysis.fearGreedIndex !== undefined) {
      const fearGreedLabel =
        analysis.fearGreedIndex < 20 ? 'Extreme Fear 😱' :
        analysis.fearGreedIndex < 40 ? 'Fear 😰' :
        analysis.fearGreedIndex < 60 ? 'Neutral 😐' :
        analysis.fearGreedIndex < 80 ? 'Greed 🤑' :
        'Extreme Greed 🚀'

      console.log(`📊 Fear & Greed Index: ${analysis.fearGreedIndex}/100 (${fearGreedLabel})`)
    }

    if (analysis.marketSentimentReasoning) {
      console.log(`💡 Reasoning: ${analysis.marketSentimentReasoning}`)
    }
    
    console.log(`\n🔥 Top 10 Mentioned Stocks:`)
    analysis.topStocks.forEach((stock, i) => {
      const sentimentEmoji = stock.sentiment === 'bullish' ? '🚀' : stock.sentiment === 'bearish' ? '📉' : '➡️'
      console.log(`\n${i + 1}. ${sentimentEmoji} $${stock.symbol}`)
      console.log(`   Mentions: ${stock.mentions}`)
      console.log(`   Sentiment: ${stock.sentiment}`)
      console.log(`   Avg Score: ${stock.avgScore}`)
      console.log(`   Confidence: ${stock.confidence}%`)
      console.log(`   Key Points:`)
      stock.keyPoints.forEach(point => {
        console.log(`     • ${point}`)
      })
    })
    
    console.log(`\n💡 Key Themes:`)
    analysis.themes.forEach((theme, i) => {
      console.log(`${i + 1}. ${theme}`)
    })
    
    console.log(`\n📝 Summary:`)
    console.log(analysis.summary)
    
    console.log('\n' + '=' .repeat(70))
    console.log('✅ Analysis complete!')
    console.log('=' .repeat(70))
    
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

main()

