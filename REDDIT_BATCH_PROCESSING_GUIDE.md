# 🎯 Reddit Batch Processing Guide - Step by Step

## 📋 Overview

This guide shows you how to:
1. Scrape top 100 posts from r/wallstreetbets and r/investing
2. Convert data to JSON format
3. Send posts in batches of 30 to GPT-4
4. Summarize crucial points for stock analysis

## 🔧 Step 1: Install Dependencies

```bash
pnpm install
```

All dependencies are already in `package.json`:
- `tsx` - For running TypeScript scripts
- `ai` SDK - For GPT integration
- Built-in `fetch` - For Reddit API calls

## 📊 Step 2: Understanding the Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Scrape Reddit                                      │
│  ├─ r/wallstreetbets (top 100 posts)                       │
│  └─ r/investing (top 100 posts)                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Convert to JSON                                    │
│  ├─ Extract: title, author, score, comments, text          │
│  ├─ Filter: Remove low-quality posts (score < 50)          │
│  └─ Format: Clean JSON structure                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Batch Processing (30 posts at a time)             │
│  ├─ Batch 1: Posts 1-30   → Send to GPT-4                 │
│  ├─ Batch 2: Posts 31-60  → Send to GPT-4                 │
│  ├─ Batch 3: Posts 61-90  → Send to GPT-4                 │
│  └─ Batch 4: Posts 91-100 → Send to GPT-4                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 4: GPT-4 Summarization                                │
│  ├─ Extract stock mentions (NVDA, TSLA, AAPL, etc.)       │
│  ├─ Identify sentiment (bullish/bearish/neutral)          │
│  ├─ Find key themes (earnings, product launches, etc.)    │
│  └─ Summarize crucial points                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Combine Results                                    │
│  ├─ Merge all batch summaries                              │
│  ├─ Aggregate stock mentions                               │
│  ├─ Calculate overall sentiment                            │
│  └─ Generate final analysis                                │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Step 3: Run the Scraper

### Option A: Scrape Both Subreddits
```bash
pnpm run scrape:reddit
```

This will:
- Scrape top 100 posts from r/wallstreetbets
- Scrape top 100 posts from r/investing
- Save raw JSON to `data/reddit-raw.json`
- Display summary in console

### Option B: Scrape Specific Subreddit
```bash
# Just r/wallstreetbets
pnpm run scrape:wsb

# Just r/investing
pnpm run scrape:investing
```

## 📝 Step 4: Process with GPT-4 in Batches

```bash
pnpm run analyze:reddit
```

This will:
1. Load the scraped JSON data
2. Split into batches of 30 posts
3. Send each batch to GPT-4 for analysis
4. Combine all summaries
5. Save results to `data/reddit-analysis.json`

## 📊 Step 5: View Results

```bash
pnpm run view:analysis
```

Shows:
- Top mentioned stocks
- Overall sentiment (bullish/bearish/neutral)
- Key themes and trends
- Crucial points for each stock
- Confidence levels

## 🔍 Example Output

### Raw JSON (from scraping):
```json
{
  "subreddit": "wallstreetbets",
  "totalPosts": 100,
  "posts": [
    {
      "id": "abc123",
      "title": "NVDA to the moon! 🚀",
      "author": "DegenTrader420",
      "score": 2847,
      "upvoteRatio": 0.94,
      "numComments": 342,
      "created": 1707350400,
      "url": "https://reddit.com/r/wallstreetbets/...",
      "selftext": "Just bought 100 calls on NVDA...",
      "flair": "YOLO",
      "stockMentions": ["NVDA"],
      "sentiment": "bullish"
    }
  ]
}
```

### GPT-4 Analysis (after batch processing):
```json
{
  "batchNumber": 1,
  "postsAnalyzed": 30,
  "summary": {
    "topStocks": [
      {
        "symbol": "NVDA",
        "mentions": 18,
        "sentiment": "bullish",
        "avgScore": 1234,
        "keyPoints": [
          "Strong earnings expectations",
          "AI chip demand increasing",
          "Multiple analyst upgrades"
        ]
      }
    ],
    "themes": [
      "AI and semiconductor boom",
      "Tech earnings season optimism",
      "Options trading activity high"
    ],
    "overallSentiment": "bullish",
    "confidence": 78
  }
}
```

## 💡 How It Works Internally

### 1. Reddit Scraping
```typescript
// Scrapes using Reddit's public JSON API
const response = await fetch(
  'https://www.reddit.com/r/wallstreetbets/top.json?t=week&limit=100'
)
```

### 2. Data Cleaning
```typescript
// Filters and formats posts
const cleanedPosts = posts
  .filter(post => post.score > 50) // Remove low-quality
  .map(post => ({
    title: post.title,
    text: post.selftext,
    score: post.score,
    // ... extract relevant fields
  }))
```

### 3. Batch Creation
```typescript
// Split into batches of 30
const batches = []
for (let i = 0; i < posts.length; i += 30) {
  batches.push(posts.slice(i, i + 30))
}
```

### 4. GPT-4 Analysis
```typescript
// Send each batch to GPT-4
for (const batch of batches) {
  const summary = await analyzeWithGPT4(batch)
  summaries.push(summary)
}
```

## ⚙️ Configuration

Edit `lib/reddit/config.ts` to customize:

```typescript
export const REDDIT_CONFIG = {
  subreddits: ['wallstreetbets', 'investing'],
  postsPerSubreddit: 100,
  batchSize: 30,
  minScore: 50, // Minimum upvotes to include
  timeframe: 'week', // 'hour', 'day', 'week', 'month', 'year', 'all'
  sortBy: 'top' // 'hot', 'new', 'top', 'rising'
}
```

## 🎯 Use Cases

### 1. Stock Sentiment Analysis
```bash
# Get sentiment for specific stock
pnpm run analyze:stock NVDA
```

### 2. Daily Market Pulse
```bash
# Get today's trending stocks
pnpm run daily:pulse
```

### 3. Compare Subreddits
```bash
# Compare sentiment between WSB and r/investing
pnpm run compare:subs
```

## 📈 Integration with Stocrates

The analysis results automatically integrate with your stock captions:

```typescript
// In lib/chat/actions.tsx
const redditAnalysis = await getRedditAnalysis(symbol)

// Adds to caption:
// "📱 Reddit Sentiment: BULLISH (47 mentions on r/wallstreetbets)"
// "Key themes: AI chip demand, earnings optimism"
```

## 🔒 Rate Limiting

Reddit's public API limits:
- **60 requests per minute**
- **2-second delay** between requests (built-in)
- **No authentication** required for public data

Our scraper automatically handles this with delays.

## 🚨 Important Notes

1. **Legal**: We only use Reddit's public JSON API (no scraping HTML)
2. **Ethical**: We respect rate limits and don't overload servers
3. **Data Quality**: Posts with score < 50 are filtered out
4. **Sentiment**: Keyword-based analysis (not perfect, but good enough)
5. **GPT-4 Costs**: Each batch costs ~$0.01-0.02 (estimate)

## 📚 Next Steps

1. Run the scraper: `pnpm run scrape:reddit`
2. Analyze with GPT-4: `pnpm run analyze:reddit`
3. View results: `pnpm run view:analysis`
4. Integrate into your app (already done!)

---

**Ready to start?** Run `pnpm run scrape:reddit` to begin! 🚀

