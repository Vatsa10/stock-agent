# agents/report_writer.py
from langchain.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from models import InvestmentReport
from datetime import datetime

def create_report_writer_agent():
    """Creates an agent that compiles the final investment report with structured output."""
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert financial report writer. Your task is to synthesize the quantitative and qualitative analyses into a single, comprehensive, and well-structured investment report.

        You will receive structured data from both quantitative and qualitative analyses. Use this data to create a professional investment report with clear recommendations."""),
        ("human", """Please compile a final investment report based on the following structured analyses:

Quantitative Analysis:
- Current Price: ${quant_analysis.current_price}
- Trend Analysis: {quant_analysis.trend_analysis}
- Key Metrics Summary: {quant_analysis.key_metrics_summary}
- 52W High: {quant_analysis.week_high_52}
- 52W Low: {quant_analysis.week_low_52}
- P/E Ratio: {quant_analysis.pe_ratio}
- Market Cap: {quant_analysis.market_cap}

Qualitative Analysis:
- Overall Sentiment: {qual_analysis.overall_sentiment}
- Sentiment Score: {qual_analysis.sentiment_score}
- Key Risks: {qual_analysis.key_risks}
- Key Opportunities: {qual_analysis.key_opportunities}
- News Summary: {qual_analysis.news_summary}
- Market Perception: {qual_analysis.market_perception}

Based on all this information, create a comprehensive investment report with:
1. Executive summary
2. Quantitative findings summary
3. Qualitative findings summary
4. Investment recommendation (Strong Buy, Buy, Hold, Sell, Strong Sell)
5. Recommendation rationale
6. Risk assessment
7. Confidence level (0-100)

Company: {company_name}
Symbol: {symbol}"""),
    ])

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro")
    # Create a structured output chain using Pydantic model
    structured_llm = llm.with_structured_output(InvestmentReport)

    # Return the full chain (prompt + structured LLM)
    return prompt | structured_llm