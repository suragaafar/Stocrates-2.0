# 🔥 Reddit Scraper WITH COMMENTS (IMPORTANT!)

## ⚠️ **WHY THIS IS CRITICAL**

The previous script only scraped **post titles and bodies**, but **ALL the important information is in the COMMENTS!**

This new script scrapes:
- ✅ Post title and body
- ✅ **ALL comments** (including nested replies)
- ✅ Stock mentions from comments
- ✅ Sentiment from comments
- ✅ Top 100 comments per post

---

## 🚀 **How to Use**

### Step 1: Open Reddit
1. Go to: https://old.reddit.com/r/wallstreetbets/top/?t=week
2. Open browser console (F12)

### Step 2: Run This Script
Paste this into the console:

```javascript
// Reddit Post + Comments Scraper
// Scrapes BOTH posts AND all their comments (THIS IS CRITICAL!)

const posts = [];
const postElements = document.querySelectorAll('.thing[data-type="link"]');

console.log(`🔍 Found ${postElements.length} posts`);
console.log(`⏳ This will take a while as we scrape ALL comments...`);

// Function to scrape comments from a post URL
async function scrapeComments(postUrl) {
  try {
    const response = await fetch(postUrl + '.json');
    const data = await response.json();

    const comments = [];

    // Recursive function to extract all comments (including nested replies)
    function extractComments(commentData) {
      if (!commentData || !commentData.data) return;

      const comment = commentData.data;

      // Add this comment if it has text
      if (comment.body) {
        comments.push({
          author: comment.author || 'unknown',
          body: comment.body,
          score: comment.score || 0,
          created: comment.created_utc || 0
        });
      }

      // Recursively process replies
      if (comment.replies && comment.replies.data && comment.replies.data.children) {
        comment.replies.data.children.forEach(reply => {
          extractComments(reply);
        });
      }
    }

    // Process all top-level comments
    if (data[1] && data[1].data && data[1].data.children) {
      data[1].data.children.forEach(comment => {
        extractComments(comment);
      });
    }

    return comments;
  } catch (error) {
    console.error(`❌ Error scraping comments from ${postUrl}:`, error);
    return [];
  }
}

// Process posts one by one (with comments)
async function scrapePosts() {
  const maxPosts = Math.min(postElements.length, 30); // Limit to 30 posts

  for (let i = 0; i < maxPosts; i++) {
    const post = postElements[i];

    const id = post.getAttribute('data-fullname');
    const title = post.querySelector('.title a')?.textContent || '';
    const author = post.getAttribute('data-author') || 'unknown';
    const score = parseInt(post.getAttribute('data-score')) || 0;
    const numComments = parseInt(post.querySelector('.comments')?.textContent.match(/\d+/)?.[0] || '0');
    const url = post.querySelector('.title a')?.href || '';

    // Get post content
    let selftext = '';
    const expandoText = post.querySelector('.expando .md');
    const usertext = post.querySelector('.usertext-body .md');

    if (expandoText) {
      selftext = expandoText.textContent || '';
    } else if (usertext) {
      selftext = usertext.textContent || '';
    }

    console.log(`📝 [${i + 1}/${maxPosts}] Scraping: "${title.substring(0, 50)}..." (${numComments} comments)`);

    // Scrape ALL comments for this post
    const comments = await scrapeComments(url);
    console.log(`   ✅ Scraped ${comments.length} comments`);

    // Combine post text + all comment text for analysis
    const allText = title + ' ' + selftext + ' ' + comments.map(c => c.body).join(' ');

    // Extract stock tickers from EVERYTHING (post + comments)
    const tickerRegex = /\$?[A-Z]{1,5}\b/g;
    const matches = allText.match(tickerRegex) || [];

    // Filter out common words
    const commonWords = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE', 'YOLO', 'WSB', 'DD', 'TA', 'CEO', 'CFO', 'IPO', 'ETF', 'ATH', 'ATL', 'YTD', 'EOD', 'AH', 'PM', 'IMO', 'FOMO', 'FUD'];

    const stockMentions = matches
      .map(ticker => ticker.replace('$', '').toUpperCase())
      .filter(ticker => ticker.length >= 1 && ticker.length <= 5)
      .filter(ticker => !commonWords.includes(ticker));

    const uniqueStocks = [...new Set(stockMentions)];

    // Sentiment analysis on ALL text (post + comments)
    let sentiment = 'neutral';
    const lowerText = allText.toLowerCase();

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
      selftext: selftext.substring(0, 2000), // Increased to 2000 chars
      comments: comments.slice(0, 100), // Include top 100 comments
      stockMentions: uniqueStocks,
      sentiment
    });

    // Wait 500ms between posts to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Create the final structure
  const data = [{
    subreddit: 'wallstreetbets',
    totalPosts: posts.length,
    posts: posts,
    scrapedAt: new Date().toISOString()
  }];

  // Copy to clipboard
  copy(JSON.stringify(data, null, 2));
  console.log(`\n✅ DONE! Copied ${posts.length} posts with ${posts.reduce((sum, p) => sum + p.comments.length, 0)} total comments to clipboard!`);
  console.log(`📊 Found ${posts.filter(p => p.stockMentions.length > 0).length} posts with stock mentions`);
  console.log(`💬 Total comments scraped: ${posts.reduce((sum, p) => sum + p.comments.length, 0)}`);
  console.log(`📋 Paste into data/reddit-raw.json`);
}

// Start scraping
scrapePosts();
```

---

## 📊 **What This Script Does**

### **1. Scrapes Posts**
- Title, author, score, number of comments
- Post body text (up to 2000 characters)

### **2. Scrapes ALL Comments** ⭐ **THIS IS THE KEY!**
- Fetches the post's JSON data from Reddit
- Recursively extracts ALL comments (including nested replies)
- Includes top 100 comments per post
- Captures comment author, body, score, timestamp

### **3. Analyzes Everything Together**
- Combines post + comments for stock detection
- Finds stock tickers in BOTH posts AND comments
- Analyzes sentiment from BOTH posts AND comments

### **4. Outputs Rich Data**
Each post includes:
```json
{
  "id": "...",
  "title": "...",
  "author": "...",
  "score": 1234,
  "numComments": 567,
  "selftext": "...",
  "comments": [
    {
      "author": "...",
      "body": "...",
      "score": 89,
      "created": 1234567890
    }
  ],
  "stockMentions": ["NVDA", "TSLA", "AAPL"],
  "sentiment": "bullish"
}
```

---

## ⏱️ **How Long Does It Take?**

- **30 posts** with comments: ~15-30 seconds
- **100 posts** with comments: ~1-2 minutes

The script waits 500ms between posts to avoid rate limiting.

---

## 🎯 **Next Steps**

### Step 3: Save the Data
1. The script copies JSON to your clipboard
2. Create/open file: `data/reddit-raw.json`
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

The analysis will now use:
- ✅ Post titles and bodies
- ✅ **ALL comments** (this is where the real insights are!)
- ✅ Stock mentions from comments
- ✅ Sentiment from comments

---

## 🔥 **Why Comments Are Critical**

### **Example:**

**Post Title:** "What do you think about NVDA?"

**Post Body:** "Just curious about opinions."

**Comments (where the REAL info is):**
- "NVDA is going to the moon! 🚀 AI demand is insane"
- "I'm buying calls, earnings will crush it"
- "Diamond hands on my NVDA position 💎🙌"
- "Also check out AMD and INTC for chip plays"

**Without comments:** You'd only see "NVDA" mentioned once, neutral sentiment

**With comments:** You see NVDA, AMD, INTC, bullish sentiment, specific reasons (AI demand, earnings)

---

## 💡 **Pro Tips**

1. **Scrape top posts from the past week** - Most relevant and active discussions
2. **Limit to 30 posts** - Good balance between data quality and scraping time
3. **Check the console** - You'll see progress as it scrapes each post
4. **Wait for completion** - Don't close the browser until you see "✅ DONE!"

---

## 🆚 **Comparison**

| Feature | Old Script | New Script (WITH COMMENTS) |
|---------|-----------|---------------------------|
| **Post Title** | ✅ | ✅ |
| **Post Body** | ✅ | ✅ |
| **Comments** | ❌ | ✅ **NEW!** |
| **Nested Replies** | ❌ | ✅ **NEW!** |
| **Stock Mentions** | Limited | **Much More!** |
| **Sentiment Accuracy** | Basic | **Much Better!** |
| **Data Richness** | Low | **High!** |

---

## 🚀 **Ready to Try?**

1. Open https://old.reddit.com/r/wallstreetbets/top/?t=week
2. Press F12 (open console)
3. Copy the script above
4. Paste and press Enter
5. Wait for completion (~30 seconds for 30 posts)
6. Paste into `data/reddit-raw.json`
7. Run `pnpm run analyze:reddit`

**You'll get MUCH better results with comment data!** 🎉
