# 🚀 Quick Start - Reddit Batch Processing

## ⚡ 3 Simple Steps

### Step 1: Scrape Reddit (5-10 minutes)
```bash
pnpm run scrape:reddit
```

**What it does:**
- Scrapes top 100 posts from r/wallstreetbets
- Scrapes top 100 posts from r/investing
- Extracts stock mentions, sentiment, scores
- Saves to `data/reddit-raw.json`

**Output:**
```
🚀 Reddit Multi-Subreddit Scraper
==================================================================
🔍 Scraping r/wallstreetbets...
  📊 Fetched 100/100 posts...
✅ Scraped 100 posts from r/wallstreetbets

🔍 Scraping r/investing...
  📊 Fetched 100/100 posts...
✅ Scraped 100 posts from r/investing

💾 Saved raw data to: data/reddit-raw.json

📊 SUMMARY
==================================================================
📱 r/wallstreetbets:
   Total posts: 100
   Unique stocks mentioned: 47
   Sentiment breakdown:
     🚀 Bullish: 62
     📉 Bearish: 18
     ➡️  Neutral: 20
   Top 5 mentioned stocks:
     1. $NVDA - 23 mentions
     2. $TSLA - 18 mentions
     3. $AAPL - 15 mentions
     4. $AMD - 12 mentions
     5. $MSFT - 10 mentions
```

---

### Step 2: Analyze with GPT-4 (2-5 minutes)
```bash
pnpm run analyze:reddit
```

**What it does:**
- Loads the scraped data
- Filters posts (score >= 50)
- Splits into batches of 30 posts
- Sends each batch to GPT-4 for analysis
- Combines all results
- Saves to `data/reddit-analysis.json`

**Output:**
```
🤖 Reddit GPT-4 Batch Analyzer
==================================================================
📂 Loading data from: data/reddit-raw.json
✅ Loaded data from 2 subreddit(s)
📊 Total posts to analyze: 200
📦 Batch size: 30 posts per batch

🚀 Starting batch analysis...
📊 Total posts: 200
✅ After filtering (score >= 50): 156
📦 Created 6 batches of 30 posts each

🤖 Analyzing batch 1 (30 posts)...
✅ Batch 1 analyzed successfully
   📊 Found 8 stocks
   📈 Overall sentiment: bullish

🤖 Analyzing batch 2 (30 posts)...
✅ Batch 2 analyzed successfully
   📊 Found 7 stocks
   📈 Overall sentiment: bullish

... (continues for all batches)

🔄 Combining 6 batch analyses...
✅ Combined analysis complete!
   📊 Top stocks: NVDA, TSLA, AAPL, AMD, MSFT
   📈 Overall sentiment: bullish (78% confidence)

💾 Saved analysis to: data/reddit-analysis.json
```

---

### Step 3: View Results
```bash
pnpm run view:analysis
```

**What it does:**
- Displays formatted analysis results
- Shows top stocks with key points
- Lists themes and trends
- Provides executive summary

**Output:**
```
📊 Reddit Analysis Viewer
==================================================================
📅 Analysis Date: 2/8/2026, 10:30:00 PM
📱 Subreddits: r/wallstreetbets, r/investing
📊 Total Posts Analyzed: 156
📦 Total Batches: 6

==================================================================
🎯 MARKET SENTIMENT
==================================================================
🚀 Overall: BULLISH
🎯 Confidence: 78%
   [███████████████████████████████████████░░░░░░░░░░] 78%

==================================================================
🔥 TOP STOCKS
==================================================================

1. 🚀 $NVDA
   ────────────────────────────────────────────────────────────
   📊 Mentions: 47
   💭 Sentiment: BULLISH
   ⬆️  Avg Score: 1,234 upvotes
   🎯 Confidence: 85%
   💡 Key Points:
      • Strong AI chip demand driving growth
      • Earnings expectations very high
      • Multiple analyst upgrades this week
      • New data center partnerships announced
      • Options activity extremely bullish

2. 🚀 $TSLA
   ────────────────────────────────────────────────────────────
   📊 Mentions: 38
   💭 Sentiment: BULLISH
   ⬆️  Avg Score: 892 upvotes
   🎯 Confidence: 72%
   💡 Key Points:
      • Cybertruck production ramping up
      • FSD (Full Self Driving) improvements
      • China sales showing strength
      • Energy storage business growing
      • Elon Musk tweets driving sentiment

... (continues for all top stocks)

==================================================================
💡 KEY THEMES
==================================================================

1. AI and semiconductor boom continues
2. Tech earnings season optimism
3. Options trading activity at all-time highs
4. Retail investor sentiment very bullish
5. Concerns about market valuations

==================================================================
📝 EXECUTIVE SUMMARY
==================================================================

Analyzed 156 posts from r/wallstreetbets and r/investing. Top 
mentioned stocks: NVDA (47 mentions, bullish), TSLA (38 mentions, 
bullish), AAPL (32 mentions, bullish). Overall market sentiment 
is bullish with 78% confidence. Key themes: AI and semiconductor 
boom continues, Tech earnings season optimism, Options trading 
activity at all-time highs.
```

---

## 📊 What You Get

### 1. **Stock Mentions**
- Which stocks are being talked about most
- How many times each stock is mentioned
- Average upvote score for posts about each stock

### 2. **Sentiment Analysis**
- Bullish, bearish, or neutral for each stock
- Overall market sentiment
- Confidence levels (0-100%)

### 3. **Key Points**
- 3-5 crucial points for each stock
- Why people are discussing it
- What events or news are driving the conversation

### 4. **Themes & Trends**
- Major themes across all posts
- Market trends
- What retail investors are focused on

### 5. **Confidence Levels**
- How confident the analysis is
- Based on post quality, upvotes, and consistency

---

## 🎯 Use in Stocrates

The analysis automatically integrates into your stock captions:

```typescript
// When user asks about NVIDIA
const redditData = await getRedditAnalysis('NVDA')

// Caption includes:
// "📱 Reddit Sentiment: BULLISH (47 mentions on r/wallstreetbets)
//  Key themes: AI chip demand, earnings optimism, analyst upgrades
//  Confidence: 85%"
```

---

## ⚙️ Customization

Edit the scripts to customize:

### Change number of posts:
```typescript
// In scripts/scrape-reddit-multi.ts
const postsPerSubreddit = 200 // Instead of 100
```

### Change batch size:
```typescript
// In scripts/analyze-reddit-batches.ts
const batchSize = 50 // Instead of 30
```

### Add more subreddits:
```typescript
// In scripts/scrape-reddit-multi.ts
const subreddits = ['wallstreetbets', 'investing', 'stocks', 'options']
```

### Change timeframe:
```typescript
// In lib/reddit/multi-subreddit-scraper.ts
scrapeSubreddit('wallstreetbets', 100, 'day') // Instead of 'week'
// Options: 'hour', 'day', 'week', 'month', 'year', 'all'
```

---

## 💰 Cost Estimate

Using Groq (free tier):
- **Scraping**: FREE (uses Reddit's public API)
- **Analysis**: FREE (Groq provides free API access)

If using OpenAI GPT-4:
- **Scraping**: FREE
- **Analysis**: ~$0.10-0.20 per 100 posts (estimate)

---

## 🚨 Troubleshooting

### "Could not find reddit-raw.json"
**Solution:** Run `pnpm run scrape:reddit` first

### "Rate limit exceeded"
**Solution:** Wait 1 minute, the scraper has built-in delays

### "Analysis failed"
**Solution:** Check your GROQ_API_KEY in `.env.local`

### "No posts found"
**Solution:** Try a different timeframe (day, week, month)

---

## 📚 Files Created

```
data/
├── reddit-raw.json       # Raw scraped data
└── reddit-analysis.json  # GPT-4 analysis results

lib/reddit/
├── multi-subreddit-scraper.ts  # Scraping logic
└── gpt-batch-analyzer.ts       # GPT-4 analysis logic

scripts/
├── scrape-reddit-multi.ts      # Scraping script
├── analyze-reddit-batches.ts   # Analysis script
└── view-reddit-analysis.ts     # Viewer script
```

---

## ✅ Ready to Start?

```bash
# 1. Scrape Reddit
pnpm run scrape:reddit

# 2. Analyze with GPT-4
pnpm run analyze:reddit

# 3. View results
pnpm run view:analysis
```

**That's it!** 🎉

