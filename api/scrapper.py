import requests
import json
import time
from datetime import datetime, timedelta

def scrape_news(token):
    """
    Scrape real crypto news from multiple sources including social media.
    Uses CoinGecko API + NewsAPI + Reddit + Twitter/X search.
    """
    
    news_list = []
    
    # Method 1: CoinGecko real market data
    try:
        coingecko_data = get_coingecko_news(token)
        if coingecko_data:
            news_list.extend(coingecko_data)
    except Exception as e:
        print(f"CoinGecko API failed: {e}")
    
    # Method 2: Reddit discussions
    try:
        reddit_data = get_reddit_news(token)
        if reddit_data:
            news_list.extend(reddit_data)
    except Exception as e:
        print(f"Reddit scrape failed: {e}")
    
    # Method 3: Twitter/X search (via web scraping)
    try:
        twitter_data = get_twitter_news(token)
        if twitter_data:
            news_list.extend(twitter_data)
    except Exception as e:
        print(f"Twitter/X scrape failed: {e}")
    
    # Method 4: General news APIs
    try:
        if len(news_list) < 5:
            general_news = get_newsapi_news(token)
            if general_news:
                news_list.extend(general_news)
    except Exception as e:
        print(f"NewsAPI failed: {e}")
    
    # Method 5: Bing News RSS
    try:
        if len(news_list) < 5:
            bing_data = get_bing_news(token)
            if bing_data:
                news_list.extend(bing_data)
    except Exception as e:
        print(f"Bing News failed: {e}")
    
    # Remove duplicates and limit to 8 headlines
    seen = set()
    unique_news = []
    for item in news_list:
        title_lower = item['title'].lower()
        if title_lower not in seen:
            seen.add(title_lower)
            unique_news.append(item)
            if len(unique_news) >= 8:
                break
    
    return unique_news if unique_news else []


def get_coingecko_news(token):
    """Fetch real market data from CoinGecko"""
    try:
        coin_id = token.lower().replace(" ", "-")
        
        url = f"https://api.coingecko.com/api/v3/coins/{coin_id}"
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0'
        })
        response.raise_for_status()
        
        data = response.json()
        news_items = []
        
        if data.get('market_data'):
            market_data = data['market_data']
            
            # Price headline
            if market_data.get('current_price'):
                price = market_data['current_price'].get('usd', 'N/A')
                change_24h = market_data.get('price_change_percentage_24h', 0)
                trend = "📈" if change_24h > 0 else "📉"
                news_items.append({
                    "title": f"{trend} {token} trading at ${price} (24h: {change_24h:.2f}%)",
                    "link": f"https://www.coingecko.com/en/coins/{coin_id}",
                    "source": "CoinGecko"
                })
            
            # Market cap change
            if market_data.get('market_cap_change_percentage_24h'):
                cap_change = market_data['market_cap_change_percentage_24h']
                news_items.append({
                    "title": f"💹 {token} Market Cap Change: {cap_change:.2f}% in 24h",
                    "link": f"https://www.coingecko.com/en/coins/{coin_id}",
                    "source": "CoinGecko"
                })
            
            # Volume
            if market_data.get('total_volume'):
                volume = market_data['total_volume'].get('usd', 0)
                if volume:
                    volume_formatted = f"${volume/1e9:.2f}B" if volume > 1e9 else f"${volume/1e6:.2f}M"
                    news_items.append({
                        "title": f"📊 24h Trading Volume: {volume_formatted}",
                        "link": f"https://www.coingecko.com/en/coins/{coin_id}",
                        "source": "CoinGecko"
                    })
        
        print(f"✅ CoinGecko: {len(news_items)} items for {token}")
        return news_items
        
    except Exception as e:
        print(f"CoinGecko error: {e}")
        return []


def get_reddit_news(token):
    """Fetch trending discussions from Reddit"""
    try:
        subreddits = ["cryptocurrency", "crypto", token.lower()]
        news_items = []
        
        for subreddit in subreddits[:2]:
            try:
                url = f"https://www.reddit.com/r/{subreddit}/search.json"
                params = {
                    'q': token,
                    'sort': 'new',
                    'limit': 5,
                    'time': 'day'
                }
                
                response = requests.get(
                    url,
                    params=params,
                    timeout=10,
                    headers={'User-Agent': 'Mozilla/5.0'}
                )
                response.raise_for_status()
                
                data = response.json()
                
                if data.get('data', {}).get('children'):
                    for post in data['data']['children'][:3]:
                        post_data = post.get('data', {})
                        title = post_data.get('title', '')
                        permalink = post_data.get('permalink', '')
                        score = post_data.get('score', 0)
                        
                        if title:
                            news_items.append({
                                "title": f"🔗 [{score}⬆️] {title[:80]}...",
                                "link": f"https://reddit.com{permalink}",
                                "source": f"Reddit r/{subreddit}"
                            })
            except:
                continue
        
        print(f"✅ Reddit: {len(news_items)} discussions for {token}")
        return news_items
        
    except Exception as e:
        print(f"Reddit error: {e}")
        return []


def get_twitter_news(token):
    """Search for Twitter/X mentions of the token"""
    try:
        news_items = []
        
        # Use Twitter search API alternative or search scrapers
        search_queries = [
            f"{token} crypto",
            f"${token.upper()} trading",
            f"{token} blockchain"
        ]
        
        for query in search_queries[:1]:
            try:
                # Use Nitter (open-source Twitter frontend) as fallback
                url = "https://api.nitter.net/search"
                params = {
                    'q': query,
                    'max_results': 5
                }
                
                response = requests.get(
                    url,
                    params=params,
                    timeout=10,
                    headers={'User-Agent': 'Mozilla/5.0'}
                )
                
                if response.status_code == 200:
                    tweets = response.json()
                    if tweets:
                        for tweet in tweets[:3]:
                            news_items.append({
                                "title": f"𝕏 {tweet.get('text', '')[:90]}...",
                                "link": f"https://twitter.com/search?q={query}",
                                "source": "Twitter/X"
                            })
            except:
                pass
        
        # If Nitter fails, try direct social sentiment
        if not news_items:
            news_items.append({
                "title": f"𝕏 Search {token} on Twitter for latest community discussions",
                "link": f"https://twitter.com/search?q={token.lower()}%20crypto",
                "source": "Twitter/X"
            })
        
        print(f"✅ Twitter/X: {len(news_items)} mentions for {token}")
        return news_items
        
    except Exception as e:
        print(f"Twitter/X error: {e}")
        return []


def get_newsapi_news(token):
    """Fetch news from NewsAPI"""
    try:
        search_query = f"{token} cryptocurrency"
        
        url = "https://newsapi.org/v2/everything"
        params = {
            'q': search_query,
            'sortBy': 'publishedAt',
            'language': 'en',
            'pageSize': 5
        }
        
        response = requests.get(url, params=params, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0'
        })
        
        if response.status_code == 401:
            return []
        
        if response.status_code == 200:
            data = response.json()
            news_items = []
            
            if data.get('articles'):
                for article in data['articles'][:5]:
                    title = article.get('title', 'No title')
                    source = article.get('source', {}).get('name', 'News')
                    news_items.append({
                        "title": f"📰 {title[:90]}...",
                        "link": article.get('url', '#'),
                        "source": source
                    })
            
            print(f"✅ NewsAPI: {len(news_items)} articles for {token}")
            return news_items
        
        return []
        
    except Exception as e:
        print(f"NewsAPI error: {e}")
        return []


def get_bing_news(token):
    """Fetch news from Bing News RSS"""
    try:
        search_query = f"{token} cryptocurrency"
        url = "https://www.bing.com/news/search"
        
        params = {
            'q': search_query,
            'format': 'rss'
        }
        
        response = requests.get(url, params=params, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0'
        })
        response.raise_for_status()
        
        import xml.etree.ElementTree as ET
        
        try:
            root = ET.fromstring(response.content)
        except:
            return []
        
        news_items = []
        
        for item in root.findall('.//item')[:5]:
            title_elem = item.find('title')
            link_elem = item.find('link')
            
            if title_elem is not None and link_elem is not None:
                title = title_elem.text or 'No title'
                news_items.append({
                    "title": f"📢 {title[:90]}...",
                    "link": link_elem.text or '#',
                    "source": "Bing News"
                })
        
        print(f"✅ Bing News: {len(news_items)} articles for {token}")
        return news_items
        
    except Exception as e:
        print(f"Bing News error: {e}")
        return []