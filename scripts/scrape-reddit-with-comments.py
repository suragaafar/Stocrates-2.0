#!/usr/bin/env python3
"""
Reddit Scraper with Comments - NO AUTHENTICATION NEEDED!
Uses Reddit's public JSON API directly
"""

import requests
import json
import time
from datetime import datetime
import os

def scrape_post_with_comments(post_url):
    """Scrape a single post with all its comments using Reddit's JSON API"""
    try:
        # Add .json to get JSON data
        json_url = post_url.rstrip('/') + '.json'

        # Set user agent to avoid blocking
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        # Add delay to avoid rate limiting
        time.sleep(2)

        response = requests.get(json_url, headers=headers)

        if response.status_code != 200:
            print(f"      ⚠️  HTTP {response.status_code} - skipping")
            return None

        data = response.json()

        # Extract post data
        post_data = data[0]['data']['children'][0]['data']

        # Extract comments recursively
        comments = []

        def extract_comments(comment_data):
            if not comment_data or 'data' not in comment_data:
                return

            comment = comment_data['data']

            # Skip "more comments" objects
            if comment.get('kind') == 'more':
                return

            # Add comment if it has body text
            if 'body' in comment and comment['body']:
                comments.append({
                    'author': comment.get('author', 'unknown'),
                    'body': comment['body'],
                    'score': comment.get('score', 0),
                    'created': int(comment.get('created_utc', 0))
                })

            # Process replies recursively
            if 'replies' in comment and comment['replies']:
                if isinstance(comment['replies'], dict) and 'data' in comment['replies']:
                    for reply in comment['replies']['data'].get('children', []):
                        extract_comments(reply)

        # Process all comments
        if len(data) > 1 and 'data' in data[1]:
            for comment in data[1]['data'].get('children', []):
                extract_comments(comment)

        # Create post object
        post = {
            'id': post_data.get('name', ''),
            'title': post_data.get('title', ''),
            'author': post_data.get('author', 'unknown'),
            'score': post_data.get('score', 0),
            'upvoteRatio': post_data.get('upvote_ratio', 0.9),
            'numComments': post_data.get('num_comments', 0),
            'created': int(post_data.get('created_utc', 0)),
            'url': post_url,
            'selftext': post_data.get('selftext', '')[:2000],
            'comments': comments,
            'stockMentions': [],
            'sentiment': 'neutral'
        }

        return post

    except Exception as e:
        print(f"      ❌ Error: {e}")
        return None

def get_subreddit_posts(subreddit, time_filter='week', limit=30):
    """Get top posts from a subreddit using Reddit's JSON API"""
    try:
        url = f'https://old.reddit.com/r/{subreddit}/top/.json?t={time_filter}&limit={limit}'

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        time.sleep(2)  # Rate limiting

        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            print(f"   ❌ HTTP {response.status_code} - cannot access r/{subreddit}")
            return []

        data = response.json()

        posts = []
        for item in data['data']['children']:
            post_data = item['data']
            post_url = f"https://old.reddit.com{post_data['permalink']}"
            posts.append(post_url)

        return posts

    except Exception as e:
        print(f"   ❌ Error getting post list: {e}")
        return []

def main():
    print("🤖 Reddit Scraper with Comments - NO AUTH NEEDED!")
    print("=" * 70)
    print("Using Reddit's public JSON API")
    print("")

    # Configuration
    subreddits = ['wallstreetbets', 'investing']
    time_filter = 'week'  # 'day', 'week', 'month', 'year', 'all'
    max_posts_per_subreddit = 20  # Reduced to avoid rate limiting

    all_subreddit_data = []

    for subreddit_name in subreddits:
        print(f"\n📂 Scraping r/{subreddit_name}...")

        # Get post URLs
        post_urls = get_subreddit_posts(subreddit_name, time_filter, max_posts_per_subreddit)
        print(f"   Found {len(post_urls)} posts")

        posts = []

        for i, post_url in enumerate(post_urls):
            print(f"   [{i+1}/{len(post_urls)}] Scraping post + comments...")

            post = scrape_post_with_comments(post_url)

            if post:
                print(f"      ✅ {post['title'][:50]}... ({len(post['comments'])} comments)")
                posts.append(post)

        all_subreddit_data.append({
            'subreddit': subreddit_name,
            'totalPosts': len(posts),
            'posts': posts,
            'scrapedAt': datetime.now().isoformat()
        })

        print(f"   ✅ Scraped {len(posts)} posts from r/{subreddit_name}")

    # Save to file
    output_file = 'data/reddit-raw.json'

    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_subreddit_data, f, indent=2, ensure_ascii=False)

    total_posts = sum(len(data['posts']) for data in all_subreddit_data)
    total_comments = sum(
        len(post['comments'])
        for data in all_subreddit_data
        for post in data['posts']
    )

    print(f"\n{'=' * 70}")
    print(f"✅ DONE!")
    print(f"📊 Total posts: {total_posts}")
    print(f"💬 Total comments: {total_comments}")
    print(f"💾 Saved to: {output_file}")
    print(f"\n🚀 Next step: Run 'pnpm run analyze:reddit'")
    print(f"{'=' * 70}")

if __name__ == '__main__':
    main()

