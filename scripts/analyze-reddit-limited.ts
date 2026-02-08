#!/usr/bin/env tsx
/**
 * Analyze Reddit data with LIMITED data to avoid rate limits
 * Uses only top posts and top comments to fit within token budget
 */

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { analyzeAllBatches } from '../lib/reddit/gpt-batch-analyzer'

interface RedditPost {
  id: string
  title: string
  selftext: string
  score: number
  numComments: number
  comments?: Array<{ author: string; body: string; score: number }>
  stockMentions: string[]
  sentiment: string
}

interface SubredditData {
  subreddit: string
  totalPosts: number
  posts: RedditPost[]
  scrapedAt: string
}

async function main() {
  console.log('🤖 Reddit Analysis - LIMITED MODE (Rate Limit Safe)')
  console.log('=' .repeat(70))
  console.log('⚠️  Using reduced dataset to fit within Groq rate limits')
  console.log('')

  // Read the scraped data
  const dataPath = path.join(process.cwd(), 'data', 'reddit-raw.json')
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ No data found! Run the scraper first:')
    console.error('   python scripts/scrape-reddit-with-comments.py')
    process.exit(1)
  }

  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as SubredditData[]

  console.log('📊 Original Data:')
  rawData.forEach(data => {
    const totalComments = data.posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)
    console.log(`   r/${data.subreddit}: ${data.posts.length} posts, ${totalComments} comments`)
  })

  // Reduce the dataset
  const MAX_POSTS_PER_SUBREDDIT = 10
  const MAX_COMMENTS_PER_POST = 5

  const limitedData: SubredditData[] = rawData.map(subredditData => {
    // Take only top posts (by score)
    const topPosts = subredditData.posts
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_POSTS_PER_SUBREDDIT)
      .map(post => ({
        ...post,
        // Take only top comments (by score)
        comments: post.comments
          ?.sort((a, b) => b.score - a.score)
          .slice(0, MAX_COMMENTS_PER_POST) || []
      }))

    return {
      ...subredditData,
      posts: topPosts,
      totalPosts: topPosts.length
    }
  })

  console.log('')
  console.log('📉 Limited Data (to fit rate limits):')
  limitedData.forEach(data => {
    const totalComments = data.posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)
    console.log(`   r/${data.subreddit}: ${data.posts.length} posts, ${totalComments} comments`)
  })

  console.log('')
  console.log('🚀 Starting AI analysis...')
  console.log('')

  try {
    // Analyze with enhanced detection and advanced sentiment
    const analysis = await analyzeAllBatches(
      limitedData,
      10, // Smaller batch size
      true, // Use enhanced stock detection
      true  // Use advanced sentiment analysis
    )

    // Save results
    const outputPath = path.join(process.cwd(), 'data', 'reddit-analysis.json')
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2))

    console.log('')
    console.log('=' .repeat(70))
    console.log('✅ ANALYSIS COMPLETE!')
    console.log('')
    console.log(`📊 Analyzed ${analysis.totalPosts} posts across ${analysis.subreddits.length} subreddits`)
    console.log(`🎯 Found ${analysis.topStocks.length} stocks`)
    console.log(`💾 Saved to: ${outputPath}`)
    console.log('')
    console.log('🔍 Top 10 Stocks:')
    analysis.topStocks.slice(0, 10).forEach((stock, i) => {
      const sentiment = stock.sentiment === 'bullish' ? '📈' : 
                       stock.sentiment === 'bearish' ? '📉' : '➡️'
      console.log(`   ${i + 1}. ${sentiment} ${stock.symbol} - ${stock.mentions} mentions (${stock.confidence}% confidence)`)
    })
    console.log('')
    console.log(`📊 Overall Sentiment: ${analysis.overallSentiment.toUpperCase()}`)
    if (analysis.fearGreedIndex !== undefined) {
      const emoji = analysis.fearGreedIndex > 60 ? '🤑' : 
                   analysis.fearGreedIndex < 40 ? '😨' : '😐'
      console.log(`${emoji} Fear & Greed Index: ${analysis.fearGreedIndex}/100`)
    }
    console.log('')
    console.log('📝 Summary:')
    console.log(`   ${analysis.summary}`)
    console.log('')
    console.log('=' .repeat(70))
    console.log('')
    console.log('🎯 Next step: Run "pnpm run view:analysis" to see full results')

  } catch (error) {
    console.error('')
    console.error('❌ Analysis failed!')
    console.error('')
    
    if (error instanceof Error && error.message.includes('rate_limit')) {
      console.error('⚠️  Still hit rate limit! Options:')
      console.error('   1. Wait for rate limit to reset (~1 hour)')
      console.error('   2. Reduce MAX_POSTS_PER_SUBREDDIT in this script')
      console.error('   3. Reduce MAX_COMMENTS_PER_POST in this script')
    } else {
      console.error(error)
    }
    
    process.exit(1)
  }
}

main()

