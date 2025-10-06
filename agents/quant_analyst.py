# agents/quant_analyst.py
from langchain.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from models import QuantitativeAnalysis

def create_quantitative_analyst_agent():
    """Creates an agent that analyzes stock price data and returns structured output."""
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert quantitative financial analyst. Your task is to analyze the provided stock price data and provide a structured analysis of key metrics and trends.

        Focus on extracting specific numerical data and providing objective analysis. Return your analysis in a structured format."""),
        ("human", """Here is the stock price data for the company:

{stock_data}

Please provide a quantitative analysis in the following structured format:
- Current price (extract as number)
- Price change in last 24 hours (if available)
- Price change percentage in last 24 hours (if available)
- 52-week high (if available)
- 52-week low (if available)
- Trading volume (if available)
- Market capitalization (if available)
- P/E ratio (if available)
- Trend analysis (brief description of recent price movements)
- Key metrics summary (overall assessment of financial health)"""),
    ])

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro")
    # Create a structured output chain using Pydantic model
    structured_llm = llm.with_structured_output(QuantitativeAnalysis)
    return prompt | structured_llm