/**
 * Reddit RSS Scraper (100% FREE - No API Key Needed)
 * Uses Reddit's public RSS feeds which don't require authentication
 */

export interface RedditPost {
  id: string
  title: string
  author: string
  score: number
  upvoteRatio: number
  numComments: number
  created: number
  url: string
  selftext: string
  flair?: string
  stockMentions: string[]
  sentiment?: 'bullish' | 'bearish' | 'neutral'
}

export interface SubredditData {
  subreddit: string
  totalPosts: number
  posts: RedditPost[]
  scrapedAt: string
}

const STOCK_TICKER_REGEX = /\b([A-Z]{2,5})\b/g
const COMMON_WORDS = new Set(['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE'])

const BULLISH_KEYWORDS = ['moon', 'rocket', 'calls', 'buy', 'bullish', 'yolo', 'tendies', 'diamond hands', 'hold', 'hodl', 'squeeze', 'rally', 'breakout', 'pump', 'gains', 'long', 'bull']
const BEARISH_KEYWORDS = ['puts', 'short', 'crash', 'dump', 'bearish', 'loss', 'paper hands', 'rug pull', 'scam', 'tank', 'plunge', 'collapse', 'dead', 'sell', 'bear']

/**
 * Parse Reddit RSS XML to extract posts
 */
function parseRSSFeed(xml: string, subreddit: string): RedditPost[] {
  const posts: RedditPost[] = []
  
  // Extract all <entry> elements
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  const entries = xml.match(entryRegex) || []
  
  for (const entry of entries) {
    try {
      // Extract fields using regex
      const titleMatch = entry.match(/<title>(.*?)<\/title>/)
      const authorMatch = entry.match(/<name>(.*?)<\/name>/)
      const linkMatch = entry.match(/<link href="(.*?)"/)
      const contentMatch = entry.match(/<content type="html">([\s\S]*?)<\/content>/)
      const updatedMatch = entry.match(/<updated>(.*?)<\/updated>/)
      const idMatch = entry.match(/<id>t3_(.*?)<\/id>/)
      
      if (!titleMatch || !linkMatch) continue
      
      const title = decodeHTML(titleMatch[1])
      const author = authorMatch ? authorMatch[1] : 'unknown'
      const url = linkMatch[1]
      const content = contentMatch ? decodeHTML(contentMatch[1]) : ''
      const created = updatedMatch ? new Date(updatedMatch[1]).getTime() / 1000 : Date.now() / 1000
      const id = idMatch ? idMatch[1] : Math.random().toString(36).substring(7)
      
      // Extract text from HTML content
      const textContent = content.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ').trim()
      
      // Extract stock tickers
      const stockMentions = extractStockTickers(title + ' ' + textContent)
      
      // Analyze sentiment
      const sentiment = analyzeSentiment(title + ' ' + textContent)
      
      // Try to extract score from content (RSS doesn't include score directly)
      const scoreMatch = content.match(/(\d+)\s+points?/)
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0
      
      // Try to extract comments count
      const commentsMatch = content.match(/(\d+)\s+comments?/)
      const numComments = commentsMatch ? parseInt(commentsMatch[1]) : 0
      
      posts.push({
        id,
        title,
        author,
        score,
        upvoteRatio: 0.9, // RSS doesn't provide this, use default
        numComments,
        created,
        url,
        selftext: textContent.substring(0, 1000),
        stockMentions,
        sentiment
      })
    } catch (error) {
      console.error('Error parsing entry:', error)
    }
  }
  
  return posts
}

/**
 * Decode HTML entities
 */
function decodeHTML(html: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' '
  }
  
  return html.replace(/&[^;]+;/g, entity => entities[entity] || entity)
}

/**
 * Scrape subreddit using RSS feed (100% FREE)
 */
export async function scrapeSubredditRSS(
  subreddit: string,
  limit: number = 100
): Promise<SubredditData> {
  console.log(`\n🔍 Scraping r/${subreddit} using RSS feed...`)
  
  const posts: RedditPost[] = []
  
  // Reddit RSS feeds: .rss for hot, /top/.rss for top
  const urls = [
    `https://www.reddit.com/r/${subreddit}/top/.rss?limit=100`,
    `https://www.reddit.com/r/${subreddit}/.rss?limit=100`
  ]
  
  for (const url of urls) {
    try {
      console.log(`  📡 Fetching: ${url}`)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      
      if (!response.ok) {
        console.log(`  ⚠️  Failed to fetch (${response.status}), trying next URL...`)
        continue
      }
      
      const xml = await response.text()
      const parsedPosts = parseRSSFeed(xml, subreddit)
      
      console.log(`  ✅ Parsed ${parsedPosts.length} posts from RSS`)
      
      // Add posts that aren't duplicates
      parsedPosts.forEach(post => {
        if (!posts.find(p => p.id === post.id)) {
          posts.push(post)
        }
      })
      
      if (posts.length >= limit) {
        break
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 2000))
      
    } catch (error) {
      console.error(`  ❌ Error fetching RSS:`, error)
    }
  }
  
  console.log(`✅ Scraped ${posts.length} posts from r/${subreddit}`)
  
  return {
    subreddit,
    totalPosts: posts.slice(0, limit).length,
    posts: posts.slice(0, limit),
    scrapedAt: new Date().toISOString()
  }
}

function extractStockTickers(text: string): string[] {
  const tickers = new Set<string>()
  
  const dollarMatches = text.match(/\$([A-Z]{2,5})\b/g)
  if (dollarMatches) {
    dollarMatches.forEach(match => {
      const ticker = match.substring(1)
      if (!COMMON_WORDS.has(ticker)) {
        tickers.add(ticker)
      }
    })
  }
  
  const matches = text.match(STOCK_TICKER_REGEX)
  if (matches) {
    matches.forEach(ticker => {
      if (ticker.length >= 2 && ticker.length <= 5 && !COMMON_WORDS.has(ticker)) {
        tickers.add(ticker)
      }
    })
  }
  
  return Array.from(tickers)
}

function analyzeSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
  const lowerText = text.toLowerCase()
  
  let bullishCount = 0
  let bearishCount = 0
  
  BULLISH_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) bullishCount++
  })
  
  BEARISH_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) bearishCount++
  })
  
  if (bullishCount > bearishCount) return 'bullish'
  if (bearishCount > bullishCount) return 'bearish'
  return 'neutral'
}

