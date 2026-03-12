from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scrapper import scrape_news
from groq import Groq
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
def analyze(data: dict):
    """
    Analyze crypto sentiment based on real market news data.
    Returns: Summary (top) + News Headlines (below)
    """
    try:
        token = data.get("token", "Bitcoin")
        print(f"\n📊 Analyzing {token}...")

        # Get real news data from multiple sources
        news = scrape_news(token)
        
        if not news:
            return {
                "success": False,
                "summary": f"Unable to fetch real-time data for {token}. Please check your connection.",
                "news": [],
                "token": token,
                "error": "No news data available"
            }

        # Format news for display
        context = "\n".join([f"- {n['title']} ({n.get('source', 'Unknown')})" for n in news])

        print(f"📰 Retrieved {len(news)} news items")
        print(f"📝 Creating analysis prompt...")

        prompt = f"""
You are a cryptocurrency market analyst. Based on the following real market data and news, provide a professional market analysis for {token}.

MARKET DATA & NEWS:
{context}

Please provide:
1. **Current Market Sentiment** - Bullish/Bearish/Neutral
2. **Key Price Action** - What's happening with {token} right now
3. **Community Buzz** - What people are discussing
4. **Quick Outlook** - Short-term market perspective (2-3 sentences)

Format clearly and concisely. Be direct and factual.
        """

        print(f"🤖 Calling GROQ API for analysis...")
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
            temperature=0.7
        )

        summary = response.choices[0].message.content
        
        print(f"✅ Analysis complete for {token}")

        # Format news with sources
        formatted_news = [
            {
                "title": n.get('title', 'No title'),
                "link": n.get('link', '#'),
                "source": n.get('source', 'Unknown')
            }
            for n in news
        ]

        return {
            "success": True,
            "summary": summary,
            "headlines": formatted_news,
            "token": token,
            "timestamp": str(datetime.now()),
            "total_sources": len(set(n.get('source', 'Unknown') for n in formatted_news))
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error during analysis: {error_msg}")
        
        # Still return news even if GROQ fails
        try:
            token = data.get("token", "Bitcoin")
            news = scrape_news(token)
            
            formatted_news = [
                {
                    "title": n.get('title', 'No title'),
                    "link": n.get('link', '#'),
                    "source": n.get('source', 'Unknown')
                }
                for n in news
            ]
            
            return {
                "success": False,
                "summary": f"Real-time data for {token}:\n\nCould not generate AI analysis due to API limitations, but showing latest market data from multiple sources.",
                "headlines": formatted_news,
                "token": token,
                "warning": "AI analysis unavailable - showing raw market data",
                "timestamp": str(datetime.now())
            }
        except:
            return {
                "success": False,
                "summary": f"Error: {error_msg}",
                "headlines": [],
                "token": data.get("token", "Bitcoin"),
                "error": str(e),
                "timestamp": str(datetime.now())
            }