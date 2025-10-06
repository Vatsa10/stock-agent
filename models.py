# models.py
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class SentimentEnum(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class RecommendationEnum(str, Enum):
    STRONG_BUY = "Strong Buy"
    BUY = "Buy"
    HOLD = "Hold"
    SELL = "Sell"
    STRONG_SELL = "Strong Sell"

class QuantitativeAnalysis(BaseModel):
    """Structured output for quantitative analysis."""
    current_price: float = Field(description="Current stock price")
    price_change_24h: Optional[float] = Field(description="Price change in the last 24 hours", default=None)
    price_change_percentage_24h: Optional[float] = Field(description="Price change percentage in the last 24 hours", default=None)
    week_high_52: Optional[float] = Field(description="52-week high price", default=None)
    week_low_52: Optional[float] = Field(description="52-week low price", default=None)
    volume: Optional[int] = Field(description="Trading volume", default=None)
    market_cap: Optional[float] = Field(description="Market capitalization", default=None)
    pe_ratio: Optional[float] = Field(description="Price-to-earnings ratio", default=None)
    trend_analysis: str = Field(description="Analysis of recent price trends")
    key_metrics_summary: str = Field(description="Summary of key financial metrics")

class QualitativeAnalysis(BaseModel):
    """Structured output for qualitative analysis."""
    overall_sentiment: SentimentEnum = Field(description="Overall sentiment from news analysis")
    sentiment_score: float = Field(description="Sentiment score between -1 and 1", ge=-1, le=1)
    key_risks: List[str] = Field(description="List of key risk factors identified")
    key_opportunities: List[str] = Field(description="List of key opportunities identified")
    news_summary: str = Field(description="Summary of recent news articles")
    market_perception: str = Field(description="Overall market perception and narrative")

class InvestmentReport(BaseModel):
    """Structured output for final investment report."""
    company_name: str = Field(description="Name of the company")
    stock_symbol: str = Field(description="Stock symbol")
    executive_summary: str = Field(description="Executive summary of the analysis")
    quantitative_summary: str = Field(description="Summary of quantitative findings")
    qualitative_summary: str = Field(description="Summary of qualitative findings")
    investment_recommendation: RecommendationEnum = Field(description="Final investment recommendation")
    recommendation_rationale: str = Field(description="Detailed rationale for the recommendation")
    risk_assessment: str = Field(description="Overall risk assessment")
    confidence_level: float = Field(description="Confidence level in the recommendation (0-100)", ge=0, le=100)
    report_date: str = Field(description="Date when the report was generated")
    analysis_period: str = Field(description="Time period covered by the analysis")
