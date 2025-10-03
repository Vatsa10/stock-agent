# Stock Market Analysis Agent

A multi-agent system for stock market analysis and insights generation.
Currently in further development

## Getting Started

### Prerequisites
- Python 3.8+
- pip package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vatsa10/stock-agent
   cd stock-agent
   ```

2. **Set up virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # or
   source venv/bin/activate  # On macOS/Linux
   ```

3. **Install dependencies**
   ```bash
   pip install uv
   uv pip install -r requirements.txt
   ```

4. **Configure API Keys**
   - Copy `.env.local` to `.env`
   - Add your API keys in the `.env` file:
     ```
     GOOGLE_API_KEY="your_google_api_key"
     ALPHA_VANTAGE_API_KEY="your_alpha_vantage_api_key"
     NEWS_API_KEY="your_news_api_key"
     ```

### Running the Application

```bash
streamlit run app.py
```

## Features

- Multi-agent architecture for comprehensive market analysis
- Real-time stock data processing
- News sentiment analysis
- Technical and fundamental analysis
- Interactive visualizations

## Agents

- **Data Collector**: Fetches real-time and historical market data
- **News Analyzer**: Processes and analyzes financial news
- **Technical Analyst**: Performs technical analysis on stock data
- **Fundamental Analyst**: Evaluates company fundamentals
- **Portfolio Manager**: Suggests portfolio adjustments

## Requirements

All required packages are listed in `requirements.txt`
