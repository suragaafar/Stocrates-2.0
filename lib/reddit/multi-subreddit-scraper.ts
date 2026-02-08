/**
 * Multi-Subreddit Scraper
 * Scrapes top posts from multiple subreddits (r/wallstreetbets, r/investing)
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
 * Scrape top posts from a subreddit
 */
export async function scrapeSubreddit(
  subreddit: string,
  limit: number = 100,
  timeframe: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' = 'week'
): Promise<SubredditData> {
  const posts: RedditPost[] = []
  let after: string | null = null
  
  console.log(`\n🔍 Scraping r/${subreddit}...`)
  
  // Reddit API returns max 100 per request, so we need to paginate
  while (posts.length < limit) {
    const remaining = limit - posts.length
    const fetchLimit = Math.min(remaining, 100)
    
    const url = `https://www.reddit.com/r/${subreddit}/top.json?t=${timeframe}&limit=${fetchLimit}${after ? `&after=${after}` : ''}`

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      })
      
      if (!response.ok) {
        console.error(`❌ Error fetching r/${subreddit}: ${response.status}`)
        break
      }
      
      const data = await response.json()
      const children = data.data.children
      
      if (children.length === 0) {
        break // No more posts
      }
      
      for (const child of children) {
        const post = child.data
        
        // Extract stock tickers
        const stockMentions = extractStockTickers(post.title + ' ' + post.selftext)
        
        // Analyze sentiment
        const sentiment = analyzeSentiment(post.title + ' ' + post.selftext)
        
        posts.push({
          id: post.id,
          title: post.title,
          author: post.author,
          score: post.score,
          upvoteRatio: post.upvote_ratio,
          numComments: post.num_comments,
          created: post.created_utc,
          url: `https://reddit.com${post.permalink}`,
          selftext: post.selftext || '',
          flair: post.link_flair_text,
          stockMentions,
          sentiment
        })
      }
      
      after = data.data.after
      
      if (!after) {
        break // No more pages
      }
      
      console.log(`  📊 Fetched ${posts.length}/${limit} posts...`)
      
      // Rate limiting - wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000))
      
    } catch (error) {
      console.error(`❌ Error scraping r/${subreddit}:`, error)
      break
    }
  }
  
  console.log(`✅ Scraped ${posts.length} posts from r/${subreddit}`)
  
  return {
    subreddit,
    totalPosts: posts.length,
    posts,
    scrapedAt: new Date().toISOString()
  }
}

/**
 * Scrape multiple subreddits
 */
export async function scrapeMultipleSubreddits(
  subreddits: string[],
  postsPerSubreddit: number = 100
): Promise<SubredditData[]> {
  console.log(`\n🚀 Starting multi-subreddit scrape...`)
  console.log(`📋 Subreddits: ${subreddits.join(', ')}`)
  console.log(`📊 Posts per subreddit: ${postsPerSubreddit}\n`)
  
  const results: SubredditData[] = []
  
  for (const subreddit of subreddits) {
    const data = await scrapeSubreddit(subreddit, postsPerSubreddit)
    results.push(data)
    
    // Wait between subreddits to be respectful
    if (subreddits.indexOf(subreddit) < subreddits.length - 1) {
      console.log(`\n⏳ Waiting 3 seconds before next subreddit...\n`)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  console.log(`\n✅ Completed scraping ${subreddits.length} subreddits!`)
  console.log(`📊 Total posts: ${results.reduce((sum, r) => sum + r.totalPosts, 0)}`)
  
  return results
}

/**
 * Extract stock tickers from text
 */
function extractStockTickers(text: string): string[] {
  const tickers = new Set<string>()
  
  // Find $TICKER format
  const dollarMatches = text.match(/\$([A-Z]{2,5})\b/g)
  if (dollarMatches) {
    dollarMatches.forEach(match => {
      const ticker = match.substring(1) // Remove $
      if (!COMMON_WORDS.has(ticker)) {
        tickers.add(ticker)
      }
    })
  }
  
  // Find standalone tickers (all caps, 2-5 letters)
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

/**
 * Analyze sentiment of text
 */
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

