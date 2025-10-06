# agents/qual_analyst.py
from langchain.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from models import QualitativeAnalysis

def create_qualitative_analyst_agent():
    """Creates an agent that analyzes news articles and returns structured output."""
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert qualitative financial analyst. Your task is to analyze the provided news articles about a company and provide a structured analysis of sentiment, risks, and opportunities.

        Focus on extracting key insights and providing objective qualitative analysis. Return your analysis in a structured format."""),
        ("human", """Here are the recent news articles for the company:

{news_data}

Please provide a qualitative analysis in the following structured format:
- Overall sentiment (positive/negative/neutral)
- Sentiment score (between -1 and 1, where -1 is very negative, 0 is neutral, and 1 is very positive)
- Key risks (list of significant risk factors mentioned)
- Key opportunities (list of significant opportunities mentioned)
- News summary (concise summary of recent news)
- Market perception (overall narrative and market perception)"""),
    ])

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro")
    # Create a structured output chain using Pydantic model
    structured_llm = llm.with_structured_output(QualitativeAnalysis)
    return prompt | structured_llm