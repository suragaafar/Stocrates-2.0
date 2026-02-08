# 🐍 Python Reddit Scraper - WITH COMMENTS! (NO AUTH NEEDED!)

## ✅ **This SOLVES the CORS Problem!**

Uses **Reddit's public JSON API** - no authentication or API keys needed!

**Benefits:**
- ✅ NO authentication required!
- ✅ NO API keys needed!
- ✅ NO CORS errors!
- ✅ Gets ALL comments (including nested)
- ✅ Works out of the box!

---

## 🚀 **Quick Start**

### **Step 1: Install Python**

Check if you have Python installed:
```bash
python --version
```

If not, download from: https://www.python.org/downloads/

### **Step 2: Install requests (if not already installed)**

```bash
pip install requests
```

### **Step 3: Run the Scraper**

```bash
python scripts/scrape-reddit-with-comments.py
```

**That's it!** The script will:
1. ✅ Scrape top 20 posts from r/wallstreetbets
2. ✅ Scrape top 20 posts from r/investing
3. ✅ Scrape **ALL comments** from each post (including nested replies)
4. ✅ Save to `data/reddit-raw.json`
5. ✅ **NO CORS ERRORS!**
6. ✅ **NO AUTHENTICATION NEEDED!**

### **Step 4: Run Analysis**

```bash
pnpm run analyze:reddit
```

---

## 📊 **What It Does**

### **1. Scrapes Posts**
- Title, author, score, upvote ratio
- Post body text (up to 2000 characters)
- Number of comments
- Post URL

### **2. Scrapes ALL Comments** ⭐
- Fetches post JSON from Reddit
- Recursively extracts ALL comments
- Includes nested replies (comments on comments)
- Captures author, body, score, timestamp

### **3. Saves Everything**
- Creates `data/reddit-raw.json`
- Includes posts + comments
- Ready for AI analysis

---

## ⏱️ **How Long Does It Take?**

- **20 posts** from r/wallstreetbets: ~1-2 minutes
- **20 posts** from r/investing: ~1-2 minutes
- **Total**: ~2-4 minutes for 40 posts with ALL comments

The script waits 2 seconds between requests to avoid rate limiting.

---

## 🔧 **Configuration**

You can edit the script to change:

```python
# In scripts/scrape-reddit-with-comments.py

subreddits = ['wallstreetbets', 'investing']  # Which subreddits
time_filter = 'week'  # 'day', 'week', 'month', 'year', 'all'
max_posts_per_subreddit = 20  # How many posts per subreddit
```

---

## 📈 **Expected Output**

```
🤖 Reddit Scraper with Comments - NO AUTH NEEDED!
======================================================================
Using Reddit's public JSON API

📂 Scraping r/wallstreetbets...
   Found 20 posts
   [1/20] Scraping post + comments...
      ✅ NVDA earnings beat - AI demand is insane!... (234 comments)
   [2/20] Scraping post + comments...
      ✅ What's your play for next week?... (567 comments)
   ...

📂 Scraping r/investing...
   Found 20 posts
   [1/20] Scraping post + comments...
      ✅ Market outlook for 2026... (123 comments)
   ...

======================================================================
✅ DONE!
📊 Total posts: 40
💬 Total comments: 5,234
💾 Saved to: data/reddit-raw.json

🚀 Next step: Run 'pnpm run analyze:reddit'
======================================================================
```

---

## 🎯 **Why PRAW Instead of Browser?**

| Feature | Browser Script | Python + PRAW |
|---------|---------------|---------------|
| **CORS Errors** | ❌ YES | ✅ NO |
| **Bulk Scraping** | ❌ Manual | ✅ Automatic |
| **Comments** | ❌ Blocked | ✅ ALL Comments! |
| **Nested Replies** | ❌ Blocked | ✅ Included! |
| **Rate Limiting** | ❌ Manual | ✅ Automatic |
| **Speed** | ⚠️ Slow | ✅ Fast |
| **Ease of Use** | ⚠️ Manual | ✅ One command |
| **Official API** | ❌ NO | ✅ YES |

---

## 💡 **What You Get**

### **Example JSON Output:**

```json
[
  {
    "subreddit": "wallstreetbets",
    "totalPosts": 15,
    "posts": [
      {
        "id": "t3_abc123",
        "title": "NVDA earnings beat - AI demand is insane! 🚀",
        "author": "trader123",
        "score": 2500,
        "upvoteRatio": 0.95,
        "numComments": 234,
        "created": 1707350400,
        "url": "https://old.reddit.com/r/wallstreetbets/...",
        "selftext": "Just bought 100 calls...",
        "comments": [
          {
            "author": "user456",
            "body": "Diamond hands! 💎🙌",
            "score": 150,
            "created": 1707351000
          },
          {
            "author": "user789",
            "body": "Also check out AMD and INTC",
            "score": 89,
            "created": 1707351500
          }
        ],
        "stockMentions": [],
        "sentiment": "neutral"
      }
    ],
    "scrapedAt": "2026-02-08T..."
  }
]
```

---

## 🔥 **Benefits**

### **1. NO CORS Errors**
Python runs outside the browser, so no CORS restrictions!

### **2. Automatic Scraping**
One command scrapes everything - no manual work!

### **3. ALL Comments Included**
Gets every comment, including nested replies!

### **4. Fast**
Scrapes 30 posts with thousands of comments in ~2 minutes!

### **5. Ready for AI**
Output is already in the correct format for analysis!

---

## 🚀 **Full Workflow**

### **1. Scrape Reddit**
```bash
python scripts/scrape-reddit-with-comments.py
```

### **2. Analyze with AI**
```bash
pnpm run analyze:reddit
```

### **3. View Results**
```bash
pnpm run view:analysis
```

---

## 🎯 **What the AI Will Do**

With comment data, the AI will:

1. ✅ **Detect ALL stocks** mentioned in posts AND comments
2. ✅ **Analyze sentiment** from posts AND comments
3. ✅ **Understand context** from community discussions
4. ✅ **Find hidden gems** mentioned only in comments
5. ✅ **Calculate Fear & Greed Index** from overall mood
6. ✅ **Provide reasoning** for each classification

---

## 📊 **Expected Results**

### **Without Comments:**
- 5-10 stocks detected
- Basic sentiment
- Limited insights

### **With Comments (Python Script):**
- **30+ stocks detected**
- **Accurate sentiment** from community
- **Deep insights** from discussions
- **Hidden opportunities** from comments
- **Real trader opinions**

---

## ⚠️ **Troubleshooting**

### **"python: command not found"**
Install Python from: https://www.python.org/downloads/

### **"No module named 'requests'"**
Run: `pip install requests`

### **"HTTP 429 - Rate limit exceeded"**
Wait a few minutes and try again. Reddit limits requests. The script already waits 2 seconds between requests.

### **Script is slow**
This is normal! The script waits 2 seconds between requests to avoid rate limiting. Scraping 40 posts takes ~2-4 minutes.

### **Getting HTTP 401 or 403 errors**
This is rare with the public JSON API. If it happens, wait a few minutes and try again.

---

## ✅ **Summary**

**Problem:** Browser CORS errors prevent comment scraping  
**Solution:** Python script bypasses CORS  
**Result:** Get ALL comments + posts in 2 minutes!  

**This is the BEST way to scrape Reddit with comments!** 🎉

---

## 🚀 **Ready to Try?**

```bash
# 1. Install requests
pip install requests

# 2. Run scraper
python scripts/scrape-reddit-with-comments.py

# 3. Analyze
pnpm run analyze:reddit

# 4. View results
pnpm run view:analysis
```

**You'll get MUCH better results with comment data!** 🚀

