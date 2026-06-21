import os
import requests
from datetime import datetime, timedelta
from app.core.config import supabase

class NewsService:
    def __init__(self):
        self.newsapi_key = os.getenv('NEWSAPI_KEY')
        if not self.newsapi_key or self.newsapi_key == 'your_actual_newsapi_key_here':
            print("⚠️  NewsAPI key not configured. Using fallback M&A news.")
            self.newsapi_key = None
    
    async def get_live_market_news(self):
        """Get M&A relevant market news - deals, investments, regulations, earnings"""
        
        # If no API key, return M&A focused fallback news
        if not self.newsapi_key:
            return self.get_ma_fallback_news()
            
        try:
            # M&A specific search queries
            ma_keywords = [
                "merger acquisition deal", 
                "private equity investment", 
                "venture capital funding",
                "IPO listing", 
                "quarterly results earnings", 
                "regulatory approval",
                "competition commission", 
                "stock market sensex nifty",
                "foreign direct investment",
                "startup funding round"
            ]
            
            # Search for M&A relevant news from last 24 hours
            from_date = (datetime.now() - timedelta(hours=24)).strftime('%Y-%m-%d')
            
            all_articles = []
            
            # Search with multiple M&A relevant queries
            for keyword in ma_keywords[:3]:  # Limit to 3 queries to stay within rate limits
                url = f"https://newsapi.org/v2/everything?q={keyword}&from={from_date}&sortBy=publishedAt&language=en&pageSize=10&apiKey={self.newsapi_key}"
                
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    articles = response.json().get('articles', [])
                    all_articles.extend(articles)
            
            # Remove duplicates based on title
            seen_titles = set()
            unique_articles = []
            for article in all_articles:
                if article['title'] not in seen_titles:
                    seen_titles.add(article['title'])
                    unique_articles.append(article)
            
            # Sort by date and take top 20
            unique_articles.sort(key=lambda x: x.get('publishedAt', ''), reverse=True)
            ma_articles = unique_articles[:20]
            
            live_news = []
            for i, article in enumerate(ma_articles):
                live_news.append({
                    "id": f"live_{i}_{article['publishedAt']}",
                    "title": article['title'],
                    "source": article['source']['name'],
                    "timestamp": article['publishedAt'],
                    "url": article['url'],
                    "companyName": self.extract_company_name(article['title']),
                    "priority": self.assess_ma_priority(article['title'], article['description'] or ''),
                    "isLive": True,
                    "dealRelevance": self.assess_deal_relevance(article['title'], article['description'] or '')
                })
            
            return live_news
            
        except Exception as e:
            print(f"NewsAPI error: {e}")
            return self.get_ma_fallback_news()
    
    def extract_company_name(self, title):
        """Extract company names from news title - focus on Indian companies"""
        indian_companies = {
            'reliance': 'Reliance Industries',
            'tata': 'Tata Group', 
            'adani': 'Adani Group',
            'infosys': 'Infosys',
            'hdfc': 'HDFC Bank',
            'icici': 'ICICI Bank',
            'mahindra': 'Mahindra Group',
            'wipro': 'Wipro',
            'bajaj': 'Bajaj Group',
            'bharti': 'Bharti Airtel',
            'itc': 'ITC Limited',
            'lt': 'Larsen & Toubro',
            'sun pharma': 'Sun Pharmaceutical',
            'asian paints': 'Asian Paints',
            'hindustan unilever': 'Hindustan Unilever',
            'coal india': 'Coal India',
            'ntpc': 'NTPC Limited',
            'ongc': 'ONGC',
            'sbi': 'State Bank of India',
            'axis bank': 'Axis Bank'
        }
        
        title_lower = title.lower()
        for keyword, company_name in indian_companies.items():
            if keyword in title_lower:
                return company_name
        
        # Check for startup names and PE/VC deals
        startup_indicators = ['startup', 'funding', 'series', 'venture', 'pe', 'vc']
        if any(indicator in title_lower for indicator in startup_indicators):
            return "Private Company"
            
        return "Market News"
    
    def assess_ma_priority(self, title, description):
        """Assess news priority for M&A context"""
        text = f"{title} {description}".lower()
        
        # Critical for M&A analysts
        critical_words = [
            'merger', 'acquisition', 'takeover', 'buyout', 'deal signed',
            'regulatory approval', 'competition commission', 'sebi', 'rbi approval'
        ]
        
        # High importance
        high_words = [
            'earnings', 'results', 'quarterly', 'annual', 'profit', 'revenue',
            'investment', 'funding', 'series a', 'series b', 'series c',
            'ipo', 'listing', 'stock market', 'sensex', 'nifty'
        ]
        
        # Medium importance
        medium_words = [
            'expansion', 'new plant', 'facility', 'partnership', 'collaboration',
            'market share', 'competition', 'rival'
        ]
        
        if any(word in text for word in critical_words):
            return "Critical"
        elif any(word in text for word in high_words):
            return "High"
        elif any(word in text for word in medium_words):
            return "Medium"
        else:
            return "Low"
    
    def assess_deal_relevance(self, title, description):
        """Score how relevant this news is for deal sourcing (1-10)"""
        text = f"{title} {description}".lower()
        score = 0
        
        # Deal-specific keywords
        deal_keywords = {
            'merger': 3, 'acquisition': 3, 'm&a': 3, 'takeover': 3,
            'private equity': 2, 'venture capital': 2, 'funding': 2,
            'ipo': 2, 'listing': 2, 'investment': 1,
            'earnings': 1, 'results': 1, 'growth': 1
        }
        
        for keyword, points in deal_keywords.items():
            if keyword in text:
                score += points
                
        return min(score, 10)  # Cap at 10
    
    def get_ma_fallback_news(self):
        """M&A focused fallback news"""
        return [
            {
                "id": "fallback_1",
                "title": "Indian M&A activity reaches record high in Q4 2024",
                "source": "M&A Today",
                "timestamp": datetime.now().isoformat(),
                "url": "#",
                "companyName": "Market Analysis",
                "priority": "High",
                "isLive": True,
                "dealRelevance": 8
            },
            {
                "id": "fallback_2",
                "title": "Private equity firms show strong interest in Indian tech startups",
                "source": "VC Circle",
                "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
                "url": "#",
                "companyName": "Private Equity",
                "priority": "High", 
                "isLive": True,
                "dealRelevance": 9
            },
            {
                "id": "fallback_3",
                "title": "Regulatory approvals accelerate for cross-border acquisitions",
                "source": "Financial Express",
                "timestamp": (datetime.now() - timedelta(hours=4)).isoformat(),
                "url": "#",
                "companyName": "Regulatory News",
                "priority": "Critical",
                "isLive": True,
                "dealRelevance": 7
            },
            {
                "id": "fallback_4",
                "title": "Tech sector leads Q3 earnings with 25% YoY growth",
                "source": "Business Standard", 
                "timestamp": (datetime.now() - timedelta(hours=6)).isoformat(),
                "url": "#",
                "companyName": "Technology Sector",
                "priority": "High",
                "isLive": True,
                "dealRelevance": 6
            }
        ]
    
    async def get_user_project_news(self, user_id: str):
        """Get project-specific news from database"""
        try:
            result = supabase.rpc('get_user_projects_news', {'p_user_id': user_id}).execute()
            
            project_news = []
            for event in result.data:
                project_news.append({
                    "id": event['id'],
                    "title": event['summary'],
                    "source": event.get('source_url', 'Internal Database'),
                    "timestamp": event['event_date'].isoformat() if hasattr(event['event_date'], 'isoformat') else event['event_date'],
                    "url": event.get('source_url', '#'),
                    "companyName": event['company_name'],
                    "priority": event['severity'],
                    "projectId": event['project_id'],
                    "isLive": False
                })
            
            return project_news
            
        except Exception as e:
            print(f"Database news error: {e}")
            return []

news_service = NewsService()
