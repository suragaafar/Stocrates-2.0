/**
 * Advanced Sentiment Analyzer
 * Uses GPT-4 to accurately detect bullish/bearish/neutral sentiment
 * Understands context, sarcasm, WSB slang, and nuance
 */

import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

const MODEL = 'llama-3.3-70b-versatile'

export interface SentimentAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  reasoning: string
  keyIndicators: string[]
  detectedTone: 'serious' | 'sarcastic' | 'humorous' | 'fearful' | 'greedy'
}

export interface StockSentiment {
  symbol: string
  companyName: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  reasoning: string
  mentions: number
  avgScore: number
  keyPoints: string[]
}

/**
 * Analyze sentiment of multiple posts using GPT-4
 * This is MUCH more accurate than keyword matching
 */
export async function analyzeSentimentBatch(
  posts: Array<{
    id: string
    title: string
    selftext: string
    score: number
    numComments: number
    stockMentions: string[]
    comments?: Array<{ author: string; body: string; score: number }>
  }>,
  batchSize: number = 10
): Promise<Map<string, StockSentiment>> {
  const stockSentiments = new Map<string, StockSentiment>()

  console.log(`\n📊 Running advanced sentiment analysis on ${posts.length} posts...`)

  // Check if we have comment data
  const hasComments = posts.some(p => p.comments && p.comments.length > 0)
  if (hasComments) {
    const totalComments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)
    console.log(`   💬 Including ${totalComments} comments in analysis (THIS IS CRITICAL!)`)
  }
  
  // Process in batches
  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize)
    
    console.log(`  🔍 Analyzing sentiment for posts ${i + 1}-${Math.min(i + batchSize, posts.length)}...`)
    
    const prompt = `You are an expert financial sentiment analyst specializing in Reddit's r/wallstreetbets and r/investing communities.

Your task: Analyze the sentiment for EACH stock mentioned in these posts AND their comments.

Posts to analyze:
${batch.map((post, idx) => {
  let postText = `
Post ${idx + 1}:
Title: ${post.title}
Content: ${post.selftext.substring(0, 800)}
Upvotes: ${post.score}
Comments: ${post.numComments}
Stocks mentioned: ${post.stockMentions.join(', ') || 'None detected'}`

  // Add comment data if available (THIS IS CRITICAL!)
  if (post.comments && post.comments.length > 0) {
    const topComments = post.comments.slice(0, 10) // Include top 10 comments
    postText += `\n\nTop Comments:\n${topComments.map((c, i) => `  ${i + 1}. [${c.score} upvotes] ${c.body.substring(0, 200)}`).join('\n')}`
  }

  return postText
}).join('\n---\n')}

Instructions:
1. For EACH stock mentioned, determine:
   - Sentiment: bullish, bearish, or neutral
   - Confidence: 0-100 (how sure are you?)
   - Reasoning: WHY you classified it this way
   - Key points: 2-3 specific reasons

2. Consider:
   - **Context**: What is the post actually saying about the stock?
   - **Sarcasm**: WSB users are often sarcastic (e.g., "This stock is going to the moon!" might be sarcastic if they bought puts)
   - **WSB Slang**:
     * "Diamond hands" 💎🙌 = Bullish (holding strong)
     * "Paper hands" 🧻🙌 = Bearish (selling/weak)
     * "To the moon" 🚀 = Bullish
     * "Apes together strong" 🦍 = Bullish (community buying)
     * "Bag holder" = Bearish (stuck with losses)
     * "YOLO" = High risk, usually bullish
     * "Puts" = Bearish
     * "Calls" = Bullish
     * "Tendies" = Profits (bullish)
     * "Loss porn" = Bearish (showing losses)
     * "Gain porn" = Bullish (showing profits)
   - **Tone**: Is it serious, joking, fearful, greedy?
   - **Upvotes**: High upvotes = community agrees
   - **Comments**: Many comments = controversial or important

3. Return ONLY valid JSON in this exact format:
{
  "stocks": [
    {
      "symbol": "NVDA",
      "companyName": "NVIDIA",
      "sentiment": "bullish",
      "confidence": 85,
      "reasoning": "Post discusses strong AI chip demand and earnings beat. High upvotes (2500+) indicate community agreement. Mentions 'calls' and 'to the moon' which are bullish indicators.",
      "keyPoints": [
        "AI chip demand driving growth",
        "Earnings beat expectations",
        "Community sentiment very positive"
      ]
    }
  ]
}

Important:
- Be accurate - don't just look for keywords
- Understand context and sarcasm
- If a post is sarcastic/joking about a stock going up, it's actually bearish
- If someone says "I'm buying puts", that's bearish even if they sound excited
- If someone says "I'm buying calls", that's bullish
- Return valid JSON only, no other text`

    try {
      const { text } = await generateText({
        model: groq(MODEL),
        prompt,
        temperature: 0.2, // Lower temperature for more consistent analysis
        maxTokens: 3000
      })
      
      // Parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        
        if (result.stocks && Array.isArray(result.stocks)) {
          result.stocks.forEach((stock: StockSentiment) => {
            const key = stock.symbol
            
            if (!stockSentiments.has(key)) {
              stockSentiments.set(key, {
                ...stock,
                mentions: 1,
                avgScore: batch.find(p => p.stockMentions.includes(stock.symbol))?.score || 0
              })
            } else {
              // Aggregate multiple mentions
              const existing = stockSentiments.get(key)!
              const newPost = batch.find(p => p.stockMentions.includes(stock.symbol))
              
              existing.mentions++
              existing.avgScore = Math.round((existing.avgScore + (newPost?.score || 0)) / 2)
              
              // Keep the sentiment with higher confidence
              if (stock.confidence > existing.confidence) {
                existing.sentiment = stock.sentiment
                existing.confidence = stock.confidence
                existing.reasoning = stock.reasoning
              }
              
              // Merge key points
              existing.keyPoints = [
                ...existing.keyPoints,
                ...stock.keyPoints
              ].filter((point, index, self) => 
                self.indexOf(point) === index
              ).slice(0, 5) // Keep top 5 unique points
            }
          })
          
          console.log(`    ✅ Analyzed ${result.stocks.length} stocks in this batch`)
        }
      }
      
      // Wait between batches to avoid rate limits
      if (i + batchSize < posts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
    } catch (error) {
      console.error(`    ❌ Error analyzing sentiment:`, error)
    }
  }
  
  console.log(`\n✅ Sentiment analysis complete!`)
  console.log(`📊 Analyzed ${stockSentiments.size} unique stocks`)
  
  // Display summary
  const bullish = Array.from(stockSentiments.values()).filter(s => s.sentiment === 'bullish').length
  const bearish = Array.from(stockSentiments.values()).filter(s => s.sentiment === 'bearish').length
  const neutral = Array.from(stockSentiments.values()).filter(s => s.sentiment === 'neutral').length
  
  console.log(`   🚀 Bullish: ${bullish}`)
  console.log(`   📉 Bearish: ${bearish}`)
  console.log(`   ➡️  Neutral: ${neutral}`)
  
  return stockSentiments
}

/**
 * Analyze overall market sentiment from all posts
 */
export async function analyzeOverallMarketSentiment(
  posts: Array<{ title: string; selftext: string; score: number }>
): Promise<{
  sentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  reasoning: string
  fearGreedIndex: number // 0-100, where 0 = extreme fear, 100 = extreme greed
}> {
  console.log(`\n🌍 Analyzing overall market sentiment...`)
  
  const prompt = `You are analyzing overall market sentiment from Reddit posts.

Sample of posts (top 10 by upvotes):
${posts.slice(0, 10).map((post, idx) => `
Post ${idx + 1} (${post.score} upvotes):
${post.title}
${post.selftext.substring(0, 300)}
`).join('\n---\n')}

Analyze the OVERALL market sentiment:
1. What is the general mood? Bullish, bearish, or neutral?
2. How confident are you? (0-100)
3. Why? What are the key indicators?
4. Fear & Greed Index (0-100):
   - 0-20: Extreme Fear
   - 20-40: Fear
   - 40-60: Neutral
   - 60-80: Greed
   - 80-100: Extreme Greed

Return ONLY valid JSON:
{
  "sentiment": "bullish",
  "confidence": 75,
  "reasoning": "Most posts are discussing buying opportunities and calls. High engagement on bullish posts. WSB slang like 'to the moon' and 'diamond hands' prevalent.",
  "fearGreedIndex": 72
}`

  try {
    const { text } = await generateText({
      model: groq(MODEL),
      prompt,
      temperature: 0.2,
      maxTokens: 1000
    })
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      console.log(`✅ Overall sentiment: ${result.sentiment.toUpperCase()} (${result.confidence}% confidence)`)
      console.log(`📊 Fear & Greed Index: ${result.fearGreedIndex}/100`)
      return result
    }
  } catch (error) {
    console.error(`❌ Error analyzing overall sentiment:`, error)
  }
  
  return {
    sentiment: 'neutral',
    confidence: 50,
    reasoning: 'Unable to analyze',
    fearGreedIndex: 50
  }
}

