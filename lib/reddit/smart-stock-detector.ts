/**
 * Smart Stock Detector
 * Uses GPT-4 to intelligently detect ALL stock/company mentions in Reddit posts
 * Not limited to ticker symbols - detects company names, products, etc.
 */

import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

const MODEL = 'llama-3.3-70b-versatile'

export interface DetectedStock {
  symbol: string
  companyName: string
  confidence: number
  context: string
}

/**
 * Use GPT-4 to detect ALL stock/company mentions in a batch of posts
 * This is much smarter than regex - it understands context
 */
export async function detectStocksInPosts(
  posts: Array<{ title: string; selftext: string }>,
  batchSize: number = 10
): Promise<Map<string, DetectedStock>> {
  const allStocks = new Map<string, DetectedStock>()
  
  // Process in smaller batches to avoid token limits
  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize)
    
    console.log(`  🔍 Detecting stocks in posts ${i + 1}-${Math.min(i + batchSize, posts.length)}...`)
    
    const prompt = `You are a financial expert analyzing Reddit posts from r/wallstreetbets and r/investing.

Your task: Identify EVERY stock, company, or investment mentioned in these posts.

Posts to analyze:
${batch.map((post, idx) => `
Post ${idx + 1}:
Title: ${post.title}
Content: ${post.selftext.substring(0, 500)}
`).join('\n---\n')}

Instructions:
1. Find ALL mentions of:
   - Stock ticker symbols (e.g., NVDA, TSLA, AAPL)
   - Company names (e.g., "NVIDIA", "Tesla", "Apple")
   - Product names that refer to companies (e.g., "iPhone" = Apple)
   - Crypto currencies (e.g., Bitcoin, Ethereum)
   - ETFs and funds (e.g., SPY, QQQ, VOO)
   - Even obscure or small-cap stocks

2. For each stock/company found:
   - Provide the ticker symbol (if known, otherwise use company name)
   - Provide the full company name
   - Rate your confidence (0-100)
   - Provide a brief context of how it was mentioned

3. Return ONLY valid JSON in this exact format:
{
  "stocks": [
    {
      "symbol": "NVDA",
      "companyName": "NVIDIA Corporation",
      "confidence": 95,
      "context": "Discussed AI chip demand and earnings"
    }
  ]
}

Important:
- Include EVERY stock mentioned, even if only mentioned once
- If you're not sure of the ticker, use the company name as the symbol
- Don't skip small or obscure companies
- Return valid JSON only, no other text`

    try {
      const { text } = await generateText({
        model: groq(MODEL),
        prompt,
        temperature: 0.3,
        maxTokens: 2000
      })
      
      // Parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        
        if (result.stocks && Array.isArray(result.stocks)) {
          result.stocks.forEach((stock: DetectedStock) => {
            // Add or update stock in the map
            if (!allStocks.has(stock.symbol)) {
              allStocks.set(stock.symbol, stock)
            } else {
              // If already exists, keep the one with higher confidence
              const existing = allStocks.get(stock.symbol)!
              if (stock.confidence > existing.confidence) {
                allStocks.set(stock.symbol, stock)
              }
            }
          })
          
          console.log(`    ✅ Found ${result.stocks.length} stocks in this batch`)
        }
      }
      
      // Wait between batches to avoid rate limits
      if (i + batchSize < posts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
    } catch (error) {
      console.error(`    ❌ Error detecting stocks in batch:`, error)
    }
  }
  
  return allStocks
}

/**
 * Enhanced stock detection that combines regex + GPT-4
 */
export async function enhancedStockDetection(
  posts: Array<{ id: string; title: string; selftext: string; stockMentions: string[] }>
): Promise<Array<{ id: string; title: string; selftext: string; stockMentions: string[]; detectedStocks: DetectedStock[] }>> {
  console.log(`\n🔍 Running enhanced stock detection on ${posts.length} posts...`)
  
  // First, use GPT-4 to detect all stocks
  const detectedStocksMap = await detectStocksInPosts(
    posts.map(p => ({ title: p.title, selftext: p.selftext })),
    10 // Process 10 posts at a time
  )
  
  console.log(`\n✅ Total unique stocks detected: ${detectedStocksMap.size}`)
  console.log(`📊 Stocks found: ${Array.from(detectedStocksMap.keys()).slice(0, 20).join(', ')}${detectedStocksMap.size > 20 ? '...' : ''}`)
  
  // Now, for each post, determine which stocks were mentioned in it
  const enhancedPosts = posts.map(post => {
    const postText = (post.title + ' ' + post.selftext).toLowerCase()
    const detectedStocks: DetectedStock[] = []
    
    // Check which detected stocks appear in this post
    detectedStocksMap.forEach((stock, symbol) => {
      const symbolLower = symbol.toLowerCase()
      const companyLower = stock.companyName.toLowerCase()
      
      // Check if ticker or company name appears in the post
      if (postText.includes(symbolLower) || 
          postText.includes(companyLower) ||
          postText.includes(`$${symbolLower}`)) {
        detectedStocks.push(stock)
      }
    })
    
    // Combine original stockMentions with detected stocks
    const allSymbols = new Set([
      ...post.stockMentions,
      ...detectedStocks.map(s => s.symbol)
    ])
    
    return {
      ...post,
      stockMentions: Array.from(allSymbols),
      detectedStocks
    }
  })
  
  return enhancedPosts
}

