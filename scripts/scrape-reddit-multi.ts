/**
 * Scrape Reddit - Multiple Subreddits
 * Scrapes top 100 posts from r/wallstreetbets and r/investing
 *
 * Run with: pnpm run scrape:reddit
 */

// Load environment variables from .env.local (not required for scraping, but good practice)
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { scrapeMultipleSubreddits } from '../lib/reddit/multi-subreddit-scraper'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

async function main() {
  console.log('🚀 Reddit Multi-Subreddit Scraper')
  console.log('=' .repeat(70))
  
  const subreddits = ['wallstreetbets', 'investing']
  const postsPerSubreddit = 100
  
  try {
    // Scrape both subreddits
    const results = await scrapeMultipleSubreddits(subreddits, postsPerSubreddit)
    
    // Create data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'data')
    try {
      mkdirSync(dataDir, { recursive: true })
    } catch (err) {
      // Directory already exists
    }
    
    // Save raw data to JSON file
    const outputPath = join(dataDir, 'reddit-raw.json')
    writeFileSync(outputPath, JSON.stringify(results, null, 2))
    
    console.log(`\n💾 Saved raw data to: ${outputPath}`)
    
    // Display summary
    console.log('\n' + '=' .repeat(70))
    console.log('📊 SUMMARY')
    console.log('=' .repeat(70))
    
    results.forEach(subredditData => {
      console.log(`\n📱 r/${subredditData.subreddit}:`)
      console.log(`   Total posts: ${subredditData.totalPosts}`)
      
      // Count stock mentions
      const allStocks = new Set<string>()
      subredditData.posts.forEach(post => {
        post.stockMentions.forEach(stock => allStocks.add(stock))
      })
      
      console.log(`   Unique stocks mentioned: ${allStocks.size}`)
      
      // Count sentiments
      const sentiments = subredditData.posts.reduce((acc, post) => {
        acc[post.sentiment || 'neutral'] = (acc[post.sentiment || 'neutral'] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      console.log(`   Sentiment breakdown:`)
      console.log(`     🚀 Bullish: ${sentiments.bullish || 0}`)
      console.log(`     📉 Bearish: ${sentiments.bearish || 0}`)
      console.log(`     ➡️  Neutral: ${sentiments.neutral || 0}`)
      
      // Top 5 stocks
      const stockCounts = new Map<string, number>()
      subredditData.posts.forEach(post => {
        post.stockMentions.forEach(stock => {
          stockCounts.set(stock, (stockCounts.get(stock) || 0) + 1)
        })
      })
      
      const topStocks = Array.from(stockCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
      
      if (topStocks.length > 0) {
        console.log(`   Top 5 mentioned stocks:`)
        topStocks.forEach(([stock, count], i) => {
          console.log(`     ${i + 1}. $${stock} - ${count} mentions`)
        })
      }
    })
    
    console.log('\n' + '=' .repeat(70))
    console.log('✅ Scraping complete!')
    console.log('\n💡 Next step: Run `pnpm run analyze:reddit` to analyze with GPT-4')
    console.log('=' .repeat(70))
    
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

main()

