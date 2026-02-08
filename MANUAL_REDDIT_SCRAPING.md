# 📋 Manual Reddit Scraping Guide (100% FREE)

Since Reddit is blocking automated requests, here's how to manually scrape Reddit posts and use them with the analysis system.

---

## 🎯 Goal
Get top 100 posts from r/wallstreetbets and r/investing manually, convert to JSON, and analyze with GPT-4.

---

## 🤖 Method: Browser Console (Semi-Automated)

### Step 1: Open Reddit
1. Go to: https://old.reddit.com/r/wallstreetbets/top/?t=week
2. Open browser console (F12)

### Step 2: Run This Script
Paste this into the console:

```javascript
// IMPROVED: Extract posts from old.reddit.com with proper content extraction
const posts = [];
const postElements = document.querySelectorAll('.thing');

postElements.forEach((post, index) => {
  if (index >= 100) return; // Limit to 100 posts

  const title = post.querySelector('.title a')?.textContent || '';
  const author = post.getAttribute('data-author') || 'unknown';
  const score = parseInt(post.getAttribute('data-score') || '0');
  const numComments = parseInt(post.querySelector('.comments')?.textContent.match(/\d+/)?.[0] || '0');
  const url = post.querySelector('.title a')?.href || '';
  const id = post.getAttribute('data-fullname') || `post_${index}`;

  // IMPROVED: Get post content from multiple possible locations
  let selftext = '';

  // Try to get from expando (expanded content)
  const expando = post.querySelector('.expando .usertext-body');
  if (expando) {
    selftext = expando.textContent.trim();
  }

  // If no expando, try to get from entry
  if (!selftext) {
    const entry = post.querySelector('.entry .usertext-body');
    if (entry) {
      selftext = entry.textContent.trim();
    }
  }

  // If still no content, try to get from data-url (for link posts)
  if (!selftext) {
    const dataUrl = post.getAttribute('data-url');
    if (dataUrl && !dataUrl.includes('i.redd.it') && !dataUrl.includes('imgur')) {
      selftext = `Link post: ${dataUrl}`;
    }
  }

  // Extract stock tickers from title AND selftext
  const text = title + ' ' + selftext;
  const stockMentions = [...new Set(
    (text.match(/\$([A-Z]{2,5})\b/g) || []).map(s => s.substring(1))
  )];

  // Also look for tickers without $ sign (common in titles)
  const allCapsWords = text.match(/\b([A-Z]{2,5})\b/g) || [];
  const commonWords = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE'];
  allCapsWords.forEach(word => {
    if (!commonWords.includes(word) && word.length >= 2 && word.length <= 5) {
      stockMentions.push(word);
    }
  });

  // Remove duplicates
  const uniqueStocks = [...new Set(stockMentions)];

  // IMPROVED: Better sentiment analysis
  const lowerText = text.toLowerCase();
  let sentiment = 'neutral';

  const bullishKeywords = ['moon', 'rocket', 'calls', 'buy', 'bullish', 'yolo', 'tendies', 'diamond hands', 'hold', 'hodl', 'squeeze', 'rally', 'breakout', 'pump', 'gains', 'long', 'bull', 'to the moon', '🚀', '💎', '🙌'];
  const bearishKeywords = ['puts', 'short', 'crash', 'dump', 'bearish', 'loss', 'paper hands', 'rug pull', 'scam', 'tank', 'plunge', 'collapse', 'dead', 'sell', 'bagholder', 'bear', '📉'];

  let bullishCount = 0;
  let bearishCount = 0;

  bullishKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) bullishCount++;
  });

  bearishKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) bearishCount++;
  });

  if (bullishCount > bearishCount) {
    sentiment = 'bullish';
  } else if (bearishCount > bullishCount) {
    sentiment = 'bearish';
  }

  posts.push({
    id,
    title,
    author,
    score,
    upvoteRatio: 0.9,
    numComments,
    created: Math.floor(Date.now() / 1000),
    url,
    selftext: selftext.substring(0, 1000), // Increased from 500 to 1000
    stockMentions: uniqueStocks,
    sentiment
  });
});

// Create the final structure
const data = [{
  subreddit: 'wallstreetbets',
  totalPosts: posts.length,
  posts: posts,
  scrapedAt: new Date().toISOString()
}];

// Copy to clipboard
copy(JSON.stringify(data, null, 2));
console.log(`✅ Copied ${posts.length} posts to clipboard!`);
console.log(`📊 Found ${posts.filter(p => p.stockMentions.length > 0).length} posts with stock mentions`);
console.log(`📋 Paste into data/reddit-raw.json`);
```

// Links:
// https://old.reddit.com/r/wallstreetbets/top/?t=week
// https://old.reddit.com/r/investing/top/?t=week

### Step 3: Save JSON
1. The script copies JSON to your clipboard
2. Create file: `data/reddit-raw.json`
3. Paste the JSON
4. Save the file

### Step 4: Repeat for r/investing
1. Go to: https://old.reddit.com/r/investing/top/?t=week
2. Run the same script
3. Manually merge the two JSON arrays

### Step 5: Run Analysis
```bash
pnpm run analyze:reddit
```

---

## 📥 Method 3: Reddit Data Export (Official)

### Step 1: Use Reddit's Data Request
1. Go to: https://www.reddit.com/settings/data-request
2. Request your data (includes saved posts)
3. Wait for email (can take 24-48 hours)

**Note:** This only works for posts you've interacted with.

---

## 🌐 Method 4: Use Pushshift (If Available)

Pushshift is a Reddit data archive. Check if it's still available:

1. Visit: https://api.pushshift.io/reddit/search/submission/?subreddit=wallstreetbets&size=100&sort=desc&sort_type=score
2. If it works, you'll get JSON data
3. Save the response to `data/reddit-raw.json`
4. Convert to the format expected by the analyzer

---

## ✅ Simplified Manual Process

If you just want to get started quickly:

### 1. Create Minimal JSON
Create `data/reddit-raw.json`:

```json
[
  {
    "subreddit": "wallstreetbets",
    "totalPosts": 10,
    "posts": [
      {
        "id": "1",
        "title": "NVDA earnings beat - stock up 8%",
        "author": "trader1",
        "score": 5000,
        "upvoteRatio": 0.95,
        "numComments": 500,
        "created": 1707350400,
        "url": "https://reddit.com",
        "selftext": "NVIDIA crushed earnings. AI demand is insane. Buying more calls.",
        "stockMentions": ["NVDA"],
        "sentiment": "bullish"
      },
      {
        "id": "2",
        "title": "TSLA delivery numbers disappointing",
        "author": "trader2",
        "score": 3000,
        "upvoteRatio": 0.88,
        "numComments": 300,
        "created": 1707340000,
        "url": "https://reddit.com",
        "selftext": "Tesla missed delivery targets. Competition heating up. Bearish.",
        "stockMentions": ["TSLA"],
        "sentiment": "bearish"
      }
    ],
    "scrapedAt": "2026-02-08T22:00:00.000Z"
  }
]
```

### 2. Run Analysis
```bash
pnpm run analyze:reddit
```

Even with just 10 posts, you'll see how the system works!

---

## 🎯 What You Need to Include

For each post, the **minimum required fields** are:

```json
{
  "id": "unique_id",
  "title": "Post title",
  "author": "username",
  "score": 1000,
  "upvoteRatio": 0.9,
  "numComments": 100,
  "created": 1707350400,
  "url": "https://reddit.com/...",
  "selftext": "Post content",
  "stockMentions": ["NVDA", "TSLA"],
  "sentiment": "bullish"
}
```

**Optional fields:**
- `flair` - Post flair (e.g., "YOLO", "DD", "Gain")
- `stockMentions` - Can be empty array `[]`
- `sentiment` - Can be "neutral" if unsure

---

## 💡 Tips

### 1. **Focus on Quality Over Quantity**
- 10 high-quality posts > 100 low-quality posts
- Look for posts with high scores (>1000 upvotes)
- Look for posts with lots of comments (>100)

### 2. **Stock Mentions**
Extract tickers like:
- `$NVDA` → `["NVDA"]`
- `$TSLA $AAPL` → `["TSLA", "AAPL"]`
- `MSFT` → `["MSFT"]`

### 3. **Sentiment**
Simple rules:
- **Bullish**: Contains "moon", "calls", "buy", "rocket", "bullish"
- **Bearish**: Contains "puts", "short", "crash", "dump", "bearish"
- **Neutral**: Everything else

### 4. **Timestamps**
Use current Unix timestamp:
```javascript
Math.floor(Date.now() / 1000)
```

---

## 🚀 After Manual Scraping

Once you have `data/reddit-raw.json`:

```bash
# Analyze with GPT-4
pnpm run analyze:reddit

# View results
pnpm run view:analysis
```

---

## 🔄 Alternative: Use RSS Feed Scraper

I've created an RSS-based scraper that might work better:

```bash
# Try the RSS scraper (100% free, no auth)
pnpm run scrape:reddit:rss
```

This uses Reddit's public RSS feeds which are less likely to be blocked.

---

## ❓ Need Help?

If you're stuck, just:
1. Create a simple JSON file with 5-10 posts
2. Run the analysis
3. See how it works
4. Add more posts later

**The system is flexible** - it works with any number of posts!

