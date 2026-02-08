/**
 * GPT-4 Batch Analyzer
 * Processes Reddit posts in batches and sends to GPT-4 for analysis
 */

import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'
import type { RedditPost, SubredditData } from './multi-subreddit-scraper'
import { enhancedStockDetection } from './smart-stock-detector'
import { analyzeSentimentBatch, analyzeOverallMarketSentiment } from './advanced-sentiment-analyzer'

const MODEL = 'llama-3.3-70b-versatile' // Using Groq's model (you can switch to GPT-4 if you have OpenAI key)

export interface StockAnalysis {
  symbol: string
  mentions: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
  avgScore: number
  keyPoints: string[]
  confidence: number
}

export interface BatchAnalysis {
  batchNumber: number
  postsAnalyzed: number
  topStocks: StockAnalysis[]
  themes: string[]
  overallSentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  summary: string
}

export interface CombinedAnalysis {
  totalPosts: number
  totalBatches: number
  subreddits: string[]
  topStocks: StockAnalysis[]
  themes: string[]
  overallSentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  summary: string
  analyzedAt: string
  fearGreedIndex?: number
  marketSentimentReasoning?: string
}

/**
 * Split posts into batches
 */
export function createBatches(posts: RedditPost[], batchSize: number = 30): RedditPost[][] {
  const batches: RedditPost[][] = []
  
  for (let i = 0; i < posts.length; i += batchSize) {
    batches.push(posts.slice(i, i + batchSize))
  }
  
  return batches
}

/**
 * Analyze a single batch with GPT-4
 */
export async function analyzeBatchWithGPT(
  batch: RedditPost[],
  batchNumber: number
): Promise<BatchAnalysis> {
  console.log(`\n🤖 Analyzing batch ${batchNumber} (${batch.length} posts)...`)
  
  // Format posts for GPT
  const postsText = batch.map((post, i) => `
POST ${i + 1}:
Title: ${post.title}
Score: ${post.score} upvotes (${Math.round(post.upvoteRatio * 100)}% upvote ratio)
Comments: ${post.numComments}
Flair: ${post.flair || 'None'}
Text: ${post.selftext.substring(0, 500)}${post.selftext.length > 500 ? '...' : ''}
Stock Mentions: ${post.stockMentions.join(', ') || 'None'}
Detected Sentiment: ${post.sentiment}
---
  `).join('\n')
  
  const prompt = `You are a financial analyst analyzing Reddit posts from r/wallstreetbets and r/investing.

Analyze these ${batch.length} posts and provide:

1. **Top Stock Mentions**: List the most mentioned stocks with:
   - Symbol
   - Number of mentions
   - Overall sentiment (bullish/bearish/neutral)
   - Average post score
   - 3-5 key points about why people are discussing it
   - Confidence level (0-100%)

2. **Key Themes**: Identify 3-5 major themes or trends across all posts

3. **Overall Market Sentiment**: Bullish, bearish, or neutral based on the posts

4. **Summary**: A 2-3 sentence summary of the most crucial insights

POSTS TO ANALYZE:
${postsText}

Respond in JSON format:
{
  "topStocks": [
    {
      "symbol": "NVDA",
      "mentions": 15,
      "sentiment": "bullish",
      "avgScore": 1234,
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "confidence": 85
    }
  ],
  "themes": ["Theme 1", "Theme 2", "Theme 3"],
  "overallSentiment": "bullish",
  "confidence": 78,
  "summary": "Brief summary here"
}`
  
  try {
    const response = await generateText({
      model: groq(MODEL),
      messages: [
        {
          role: 'system',
          content: 'You are a financial analyst. Respond only with valid JSON, no markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      maxTokens: 2000
    })
    
    // Parse JSON response
    let jsonText = response.text.trim()
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '')
    }
    
    const analysis = JSON.parse(jsonText)
    
    console.log(`✅ Batch ${batchNumber} analyzed successfully`)
    console.log(`   📊 Found ${analysis.topStocks?.length || 0} stocks`)
    console.log(`   📈 Overall sentiment: ${analysis.overallSentiment}`)
    
    return {
      batchNumber,
      postsAnalyzed: batch.length,
      topStocks: analysis.topStocks || [],
      themes: analysis.themes || [],
      overallSentiment: analysis.overallSentiment || 'neutral',
      confidence: analysis.confidence || 50,
      summary: analysis.summary || ''
    }
    
  } catch (error) {
    console.error(`❌ Error analyzing batch ${batchNumber}:`, error)
    
    // Return empty analysis on error
    return {
      batchNumber,
      postsAnalyzed: batch.length,
      topStocks: [],
      themes: [],
      overallSentiment: 'neutral',
      confidence: 0,
      summary: 'Analysis failed'
    }
  }
}

/**
 * Analyze all batches and combine results
 */
export async function analyzeAllBatches(
  subredditData: SubredditData[],
  batchSize: number = 30,
  useEnhancedDetection: boolean = true,
  useAdvancedSentiment: boolean = true
): Promise<CombinedAnalysis> {
  console.log(`\n🚀 Starting batch analysis...`)

  // Combine all posts from all subreddits
  const allPosts = subredditData.flatMap(data => data.posts)

  // Filter out low-quality posts (score < 50)
  let filteredPosts = allPosts.filter(post => post.score >= 50)

  console.log(`📊 Total posts: ${allPosts.length}`)
  console.log(`✅ After filtering (score >= 50): ${filteredPosts.length}`)

  // ENHANCED: Use GPT-4 to detect ALL stocks mentioned (not just ticker symbols)
  if (useEnhancedDetection && filteredPosts.length > 0) {
    console.log(`\n🧠 Using AI-powered stock detection to find ALL company mentions...`)
    filteredPosts = await enhancedStockDetection(filteredPosts) as any
  }

  // ADVANCED SENTIMENT: Use GPT-4 to accurately analyze sentiment
  let stockSentiments: Map<string, any> | undefined
  let overallMarketSentiment: any | undefined

  if (useAdvancedSentiment && filteredPosts.length > 0) {
    console.log(`\n🎯 Running advanced sentiment analysis (understands context, sarcasm, WSB slang)...`)
    stockSentiments = await analyzeSentimentBatch(filteredPosts, 10)
    overallMarketSentiment = await analyzeOverallMarketSentiment(
      filteredPosts.map(p => ({ title: p.title, selftext: p.selftext, score: p.score }))
    )
  }

  // Create batches
  const batches = createBatches(filteredPosts, batchSize)
  console.log(`📦 Created ${batches.length} batches of ${batchSize} posts each\n`)
  
  // Analyze each batch
  const batchAnalyses: BatchAnalysis[] = []
  
  for (let i = 0; i < batches.length; i++) {
    const analysis = await analyzeBatchWithGPT(batches[i], i + 1)
    batchAnalyses.push(analysis)
    
    // Wait between batches to avoid rate limits
    if (i < batches.length - 1) {
      console.log(`   ⏳ Waiting 2 seconds before next batch...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  // Combine all batch analyses
  const combined = combineBatchAnalyses(batchAnalyses, subredditData, filteredPosts.length)

  // Add advanced sentiment analysis results if available
  if (stockSentiments && overallMarketSentiment) {
    // Merge stock sentiments from advanced analysis
    const enhancedStocks = combined.topStocks.map(stock => {
      const advancedSentiment = stockSentiments!.get(stock.symbol)
      if (advancedSentiment) {
        return {
          ...stock,
          sentiment: advancedSentiment.sentiment,
          confidence: advancedSentiment.confidence,
          keyPoints: advancedSentiment.keyPoints || stock.keyPoints
        }
      }
      return stock
    })

    combined.topStocks = enhancedStocks
    combined.overallSentiment = overallMarketSentiment.sentiment
    combined.confidence = overallMarketSentiment.confidence
    combined.fearGreedIndex = overallMarketSentiment.fearGreedIndex
    combined.marketSentimentReasoning = overallMarketSentiment.reasoning
  }

  return combined
}

/**
 * Combine multiple batch analyses into one
 */
function combineBatchAnalyses(
  batchAnalyses: BatchAnalysis[],
  subredditData: SubredditData[],
  totalPosts: number
): CombinedAnalysis {
  console.log(`\n🔄 Combining ${batchAnalyses.length} batch analyses...`)

  // Aggregate stock mentions
  const stockMap = new Map<string, {
    mentions: number
    sentiments: string[]
    scores: number[]
    keyPoints: Set<string>
    confidences: number[]
  }>()

  batchAnalyses.forEach(batch => {
    batch.topStocks.forEach(stock => {
      if (!stockMap.has(stock.symbol)) {
        stockMap.set(stock.symbol, {
          mentions: 0,
          sentiments: [],
          scores: [],
          keyPoints: new Set(),
          confidences: []
        })
      }

      const data = stockMap.get(stock.symbol)!
      data.mentions += stock.mentions
      data.sentiments.push(stock.sentiment)
      data.scores.push(stock.avgScore)
      stock.keyPoints.forEach(point => data.keyPoints.add(point))
      data.confidences.push(stock.confidence)
    })
  })

  // Convert to StockAnalysis array
  const topStocks: StockAnalysis[] = Array.from(stockMap.entries())
    .map(([symbol, data]) => {
      // Calculate most common sentiment
      const sentimentCounts = data.sentiments.reduce((acc, s) => {
        acc[s] = (acc[s] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const sentiment = Object.entries(sentimentCounts)
        .sort((a, b) => b[1] - a[1])[0][0] as 'bullish' | 'bearish' | 'neutral'

      return {
        symbol,
        mentions: data.mentions,
        sentiment,
        avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        keyPoints: Array.from(data.keyPoints).slice(0, 5),
        confidence: Math.round(data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length)
      }
    })
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 10) // Top 10 stocks

  // Aggregate themes
  const allThemes = batchAnalyses.flatMap(b => b.themes)
  const themeCounts = allThemes.reduce((acc, theme) => {
    acc[theme] = (acc[theme] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const themes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme)

  // Calculate overall sentiment
  const sentimentCounts = batchAnalyses.reduce((acc, b) => {
    acc[b.overallSentiment] = (acc[b.overallSentiment] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const overallSentiment = Object.entries(sentimentCounts)
    .sort((a, b) => b[1] - a[1])[0][0] as 'bullish' | 'bearish' | 'neutral'

  // Calculate average confidence
  const avgConfidence = Math.round(
    batchAnalyses.reduce((sum, b) => sum + b.confidence, 0) / batchAnalyses.length
  )

  // Generate combined summary
  const summary = `Analyzed ${totalPosts} posts from ${subredditData.map(d => `r/${d.subreddit}`).join(' and ')}. ` +
    `Top mentioned stocks: ${topStocks.slice(0, 3).map(s => `${s.symbol} (${s.mentions} mentions, ${s.sentiment})`).join(', ')}. ` +
    `Overall market sentiment is ${overallSentiment} with ${avgConfidence}% confidence. ` +
    `Key themes: ${themes.slice(0, 3).join(', ')}.`

  console.log(`✅ Combined analysis complete!`)
  console.log(`   📊 Top stocks: ${topStocks.slice(0, 5).map(s => s.symbol).join(', ')}`)
  console.log(`   📈 Overall sentiment: ${overallSentiment} (${avgConfidence}% confidence)`)

  return {
    totalPosts,
    totalBatches: batchAnalyses.length,
    subreddits: subredditData.map(d => d.subreddit),
    topStocks,
    themes,
    overallSentiment,
    confidence: avgConfidence,
    summary,
    analyzedAt: new Date().toISOString()
  }
}

