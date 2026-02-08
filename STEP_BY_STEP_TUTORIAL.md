# 📖 Step-by-Step Tutorial: Reddit Batch Processing

## 🎯 Goal
Scrape top 100 posts from r/wallstreetbets and r/investing, convert to JSON, send in batches of 30 to GPT-4, and get crucial stock insights.

---

## 📋 Prerequisites

✅ You already have:
- Node.js and pnpm installed
- Groq API key in `.env.local`
- All dependencies installed

---

## 🚀 Step 1: Scrape Reddit Posts

### Command:
```bash
pnpm run scrape:reddit
```

### What happens:
1. **Connects to Reddit's public JSON API** (no authentication needed)
2. **Fetches top 100 posts** from r/wallstreetbets
3. **Fetches top 100 posts** from r/investing
4. **Extracts data** from each post:
   - Title
   - Author
   - Score (upvotes)
   - Number of comments
   - Post text
   - Stock ticker mentions (e.g., NVDA, TSLA)
   - Sentiment (bullish/bearish/neutral)
5. **Saves to JSON file**: `data/reddit-raw.json`

### Expected output:
```
🚀 Reddit Multi-Subreddit Scraper
==================================================================
🔍 Scraping r/wallstreetbets...
  📊 Fetched 100/100 posts...
✅ Scraped 100 posts from r/wallstreetbets

⏳ Waiting 3 seconds before next subreddit...

🔍 Scraping r/investing...
  📊 Fetched 100/100 posts...
✅ Scraped 100 posts from r/investing

✅ Completed scraping 2 subreddits!
📊 Total posts: 200

💾 Saved raw data to: data/reddit-raw.json
```

### Time: ~5-10 minutes
(Reddit API has rate limits, so there are 2-second delays between requests)

---

## 🤖 Step 2: Analyze with GPT-4 in Batches

### Command:
```bash
pnpm run analyze:reddit
```

### What happens:
1. **Loads** `data/reddit-raw.json`
2. **Filters** posts with score < 50 (removes low-quality posts)
3. **Splits** remaining posts into batches of 30
4. **For each batch**:
   - Formats the 30 posts into a prompt
   - Sends to GPT-4 (via Groq API)
   - Asks GPT-4 to identify:
     - Top mentioned stocks
     - Sentiment for each stock
     - Key points about each stock
     - Overall themes
     - Confidence levels
5. **Combines** all batch results into one analysis
6. **Saves** to `data/reddit-analysis.json`

### Expected output:
```
🤖 Reddit GPT-4 Batch Analyzer
==================================================================
📂 Loading data from: data/reddit-raw.json
✅ Loaded data from 2 subreddit(s)
📊 Total posts to analyze: 200

🚀 Starting batch analysis...
📊 Total posts: 200
✅ After filtering (score >= 50): 156
📦 Created 6 batches of 30 posts each

🤖 Analyzing batch 1 (30 posts)...
✅ Batch 1 analyzed successfully
   📊 Found 8 stocks
   📈 Overall sentiment: bullish
   ⏳ Waiting 2 seconds before next batch...

🤖 Analyzing batch 2 (30 posts)...
✅ Batch 2 analyzed successfully
   📊 Found 7 stocks
   📈 Overall sentiment: bullish
   ⏳ Waiting 2 seconds before next batch...

... (continues for all 6 batches)

🔄 Combining 6 batch analyses...
✅ Combined analysis complete!
   📊 Top stocks: NVDA, TSLA, AAPL, AMD, MSFT
   📈 Overall sentiment: bullish (78% confidence)

💾 Saved analysis to: data/reddit-analysis.json
```

### Time: ~2-5 minutes
(Depends on number of batches and API response time)

---

## 📊 Step 3: View the Results

### Command:
```bash
pnpm run view:analysis
```

### What happens:
1. **Loads** `data/reddit-analysis.json`
2. **Displays** formatted results:
   - Top 10 mentioned stocks
   - Sentiment for each stock
   - Key points about each stock
   - Overall market sentiment
   - Key themes
   - Executive summary

### Expected output:
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

... (shows all top 10 stocks)
```

---

## 🎓 Understanding the Data

### JSON Structure (reddit-raw.json):
```json
[
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
]
```

### JSON Structure (reddit-analysis.json):
```json
{
  "totalPosts": 156,
  "totalBatches": 6,
  "subreddits": ["wallstreetbets", "investing"],
  "topStocks": [
    {
      "symbol": "NVDA",
      "mentions": 47,
      "sentiment": "bullish",
      "avgScore": 1234,
      "keyPoints": [
        "Strong AI chip demand driving growth",
        "Earnings expectations very high",
        "Multiple analyst upgrades this week"
      ],
      "confidence": 85
    }
  ],
  "themes": [
    "AI and semiconductor boom continues",
    "Tech earnings season optimism"
  ],
  "overallSentiment": "bullish",
  "confidence": 78,
  "summary": "Analyzed 156 posts from r/wallstreetbets and r/investing..."
}
```

---

## 🔧 How It Works Internally

### 1. Scraping Process:
```
Reddit API → Fetch JSON → Extract data → Filter → Save
```

### 2. Batch Processing:
```
Load JSON → Filter (score >= 50) → Split into batches of 30
```

### 3. GPT-4 Analysis (per batch):
```
Format 30 posts → Send to GPT-4 → Parse JSON response → Extract insights
```

### 4. Combining Results:
```
Merge all batches → Aggregate stock mentions → Calculate overall sentiment
```

---

## 💡 Tips & Best Practices

### 1. **Run Daily**
Set up a cron job to scrape and analyze daily:
```bash
# Every day at 9 AM
0 9 * * * cd /path/to/stocrates && pnpm run scrape:reddit && pnpm run analyze:reddit
```

### 2. **Filter by Quality**
The script already filters posts with score < 50. Adjust if needed:
```typescript
// In lib/reddit/gpt-batch-analyzer.ts
const filteredPosts = allPosts.filter(post => post.score >= 100) // Higher threshold
```

### 3. **Adjust Batch Size**
30 posts per batch is optimal for GPT-4. Smaller batches = more API calls, larger batches = less detailed analysis.

### 4. **Cache Results**
The analysis is saved to JSON, so you can reuse it without re-running GPT-4:
```typescript
import analysis from './data/reddit-analysis.json'
```

---

## 🎯 Next Steps

1. ✅ **Run the scraper**: `pnpm run scrape:reddit`
2. ✅ **Analyze with GPT-4**: `pnpm run analyze:reddit`
3. ✅ **View results**: `pnpm run view:analysis`
4. 🔄 **Integrate into Stocrates** (already done!)
5. 📅 **Set up daily automation** (optional)

---

## 📚 Additional Resources

- **Full Guide**: `REDDIT_BATCH_PROCESSING_GUIDE.md`
- **Quick Start**: `QUICK_START_REDDIT.md`
- **Original Reddit Scraper**: `lib/news/reddit-scraper.ts`

---

**Ready to start?** Run `pnpm run scrape:reddit` now! 🚀

