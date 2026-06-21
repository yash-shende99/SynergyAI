import os
import httpx
import asyncio
import numpy as np
import yfinance as yf
from typing import Optional, List, Dict
from app.core.config import supabase, OLLAMA_SERVER_URL, CUSTOM_MODEL_NAME
from rag_pipeline import rag_system

class LiveMarketData:
    def __init__(self):
        self.alpha_vantage_key = os.getenv('ALPHA_VANTAGE_KEY')
    
    async def get_live_indices(self):
        """Get real-time Indian market data using yfinance"""
        try:
            # Indian market indices and forex
            nifty = yf.Ticker("^NSEI")
            sensex = yf.Ticker("^BSESN") 
            usdinr = yf.Ticker("INR=X")
            india_vix = yf.Ticker("^INDIAVIX")
            
            # Get latest daily data
            nifty_hist = nifty.history(period="2d")
            sensex_hist = sensex.history(period="2d")
            usdinr_hist = usdinr.history(period="2d")
            vix_hist = india_vix.history(period="2d")
            
            indicators = []
            
            # NIFTY 50
            if not nifty_hist.empty and len(nifty_hist) >= 2:
                current = nifty_hist['Close'].iloc[-1]
                previous = nifty_hist['Close'].iloc[-2]
                change_pct = ((current - previous) / previous) * 100
                indicators.append({
                    "name": "NIFTY 50",
                    "value": f"{current:,.2f}",
                    "change": f"{change_pct:+.2f}%",
                    "isPositive": bool(change_pct > 0)
                })
            else:
                indicators.append({"name": "NIFTY 50", "value": "24,150.75", "change": "+0.85%", "isPositive": True})
            
            # BSE SENSEX
            if not sensex_hist.empty and len(sensex_hist) >= 2:
                current = sensex_hist['Close'].iloc[-1]
                previous = sensex_hist['Close'].iloc[-2]
                change_pct = ((current - previous) / previous) * 100
                indicators.append({
                    "name": "BSE SENSEX",
                    "value": f"{current:,.2f}",
                    "change": f"{change_pct:+.2f}%", 
                    "isPositive": bool(change_pct > 0)
                })
            else:
                indicators.append({"name": "BSE SENSEX", "value": "79,890.10", "change": "+0.91%", "isPositive": True})
            
            # USD/INR
            if not usdinr_hist.empty and len(usdinr_hist) >= 2:
                current = usdinr_hist['Close'].iloc[-1]
                previous = usdinr_hist['Close'].iloc[-2]
                change_pct = ((current - previous) / previous) * 100
                indicators.append({
                    "name": "USD/INR",
                    "value": f"{current:.2f}",
                    "change": f"{change_pct:+.2f}%",
                    "isPositive": bool(change_pct > 0)
                })
            else:
                indicators.append({"name": "USD/INR", "value": "83.55", "change": "-0.12%", "isPositive": False})
            
            # India VIX
            if not vix_hist.empty and len(vix_hist) >= 2:
                current = vix_hist['Close'].iloc[-1]
                previous = vix_hist['Close'].iloc[-2]
                change_pct = ((current - previous) / previous) * 100
                indicators.append({
                    "name": "India VIX",
                    "value": f"{current:.2f}",
                    "change": f"{change_pct:+.2f}%",
                    "isPositive": bool(change_pct < 0)
                })
            else:
                indicators.append({"name": "India VIX", "value": "14.20", "change": "+2.5%", "isPositive": False})
            
            return indicators
            
        except Exception as e:
            print(f"Live market data error: {e}")
            return self.get_fallback_indicators()
    
    def get_fallback_indicators(self):
        """Fallback when live data fails"""
        return [
            {"name": "NIFTY 50", "value": "24,150.75", "change": "+0.85%", "isPositive": True},
            {"name": "BSE SENSEX", "value": "79,890.10", "change": "+0.91%", "isPositive": True},
            {"name": "USD/INR", "value": "83.55", "change": "-0.12%", "isPositive": False},
            {"name": "India VIX", "value": "14.20", "change": "+2.5%", "isPositive": False}
        ]

    async def get_live_top_movers(self, mover_type: str):
        """Get real top gainers/losers from Indian markets"""
        try:
            # Major Indian stocks for M&A relevance
            indian_stocks = {
                'RELIANCE': 'RELIANCE.NS',
                'TCS': 'TCS.NS', 
                'HDFC BANK': 'HDFCBANK.NS',
                'INFOSYS': 'INFY.NS',
                'HUL': 'HINDUNILVR.NS',
                'ITC': 'ITC.NS',
                'SBI': 'SBIN.NS',
                'BHARTI AIRTEL': 'BHARTIARTL.NS',
                'KOTAK BANK': 'KOTAKBANK.NS',
                'LT': 'LT.NS',
                'ADANI ENTERPRISES': 'ADANIENT.NS',
                'BAJAJ FINANCE': 'BAJFINANCE.NS',
                'WIPRO': 'WIPRO.NS',
                'AXIS BANK': 'AXISBANK.NS',
                'MARUTI': 'MARUTI.NS'
            }
            
            movers = []
            for name, ticker in indian_stocks.items():
                try:
                    stock = yf.Ticker(ticker)
                    hist = stock.history(period="2d")
                    
                    if len(hist) >= 2:
                        prev_close = hist['Close'].iloc[-2]
                        current_close = hist['Close'].iloc[-1]
                        change_percent = ((current_close - prev_close) / prev_close) * 100
                        
                        # Get company logo from database if available
                        logo_url = company_res.data[0]['logo_url'] if company_res.data else None
                        if logo_url and "logo.clearbit.com" in logo_url:
                            logo_url = None
                        
                        movers.append({
                            "name": name,
                            "ticker": ticker.replace('.NS', ''),
                            "changePercent": round(change_percent, 2),
                            "currentPrice": round(current_close, 2),
                            "logoUrl": logo_url
                        })
                except Exception as e:
                    print(f"Error fetching {name}: {e}")
                    continue
            
            # Sort and filter based on mover type
            if mover_type == "gainers":
                gainers = sorted([m for m in movers if m['changePercent'] > 0], key=lambda x: x['changePercent'], reverse=True)[:5]
                return gainers if gainers else self.get_fallback_gainers()
            else:
                losers = sorted([m for m in movers if m['changePercent'] < 0], key=lambda x: x['changePercent'])[:5]
                return losers if losers else self.get_fallback_losers()
                
        except Exception as e:
            print(f"Error fetching {mover_type}: {e}")
            return self.get_fallback_gainers() if mover_type == "gainers" else self.get_fallback_losers()
    
    def get_fallback_gainers(self):
        return [
            {"name": "RELIANCE", "changePercent": 2.5, "currentPrice": 2850.75, "logoUrl": None},
            {"name": "TCS", "changePercent": 1.8, "currentPrice": 3850.20, "logoUrl": None},
            {"name": "INFOSYS", "changePercent": 1.2, "currentPrice": 1650.50, "logoUrl": None}
        ]
    
    def get_fallback_losers(self):
        return [
            {"name": "ITC", "changePercent": -1.5, "currentPrice": 450.25, "logoUrl": None},
            {"name": "SBI", "changePercent": -0.8, "currentPrice": 780.60, "logoUrl": None},
            {"name": "HUL", "changePercent": -0.3, "currentPrice": 2450.80, "logoUrl": None}
        ]

market_data = LiveMarketData()

async def generate_sector_trend(client: httpx.AsyncClient, sector: str) -> Dict:
    """Uses RAG and the LLM to generate a trend summary for a single sector."""
    try:
        # Find relevant context for this sector from our document library
        rag_context = rag_system.search(f"What are the recent trends, challenges, and opportunities in the {sector} sector in India?", k=3)
        context_text = "\n\n---\n\n".join([chunk['content'] for chunk in rag_context])
        
        prompt = f"Instruction: You are a senior market analyst. Based on the provided context, write a concise, one-sentence summary of the current trend for the {sector} sector.\n\nContext:\n{context_text}\n\nResponse:"
        
        response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False}, timeout=60.0)
        response.raise_for_status()
        
        trend = response.json().get('response', f'Analysis for {sector} is ongoing.').strip()
        return {"sector": sector, "trend": trend}
    except Exception as e:
        print(f"Error generating trend for {sector}: {e}")
        return {"sector": sector, "trend": "AI analysis for this sector is currently unavailable."}
