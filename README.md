# Stock Market Analysis Agent

A multi-agent system for stock market analysis and investment insights generation using AI agents, LangChain, and LangGraph.

## Architecture

The system uses a multi-agent architecture with LangGraph to orchestrate different specialized agents:
1. **Data Fetcher Agent** - Retrieves real-time stock data and news
2. **Quantitative Analyst Agent** - Analyzes numerical stock data and metrics
3. **Qualitative Analyst Agent** - Processes news sentiment and market perception
4. **Report Writer Agent** - Synthesizes all analysis into a comprehensive investment report

## Project Structure

```
├── agents/                 # Individual agent implementations
│   ├── data_fetcher.py     # Data collection agent
│   ├── quant_analyst.py    # Quantitative analysis agent
│   ├── qual_analyst.py     # Qualitative analysis agent
│   └── report_writer.py    # Report generation agent
├── tools/                  # Custom tools for data retrieval
│   └── financial_tools.py  # Stock price and news APIs
├── frontend/               # Next.js frontend application
├── graph.py                # LangGraph workflow orchestration
├── models.py               # Pydantic models for structured outputs
├── app.py                  # Streamlit application
├── api.py                  # Flask REST API backend
├── requirements.txt        # Python dependencies
└── start.bat/start.sh      # Startup scripts
```

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+ (for frontend)
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

### Running the Applications

#### Option 1: Streamlit Interface
```bash
streamlit run app.py
```

#### Option 2: Flask REST API
```bash
python api.py
```

#### Option 3: Frontend Application
```bash
cd frontend
npm install
npm run dev
```

## Features

- Multi-agent architecture for comprehensive market analysis
- Real-time stock data processing with Alpha Vantage API
- News sentiment analysis using NewsAPI
- Technical and fundamental analysis
- Interactive visualizations
- REST API for integration with other applications
- Modern Next.js frontend with real-time updates

## Agents

- **Data Fetcher**: Retrieves real-time stock prices and recent news
- **Quantitative Analyst**: Analyzes numerical stock metrics and trends
- **Qualitative Analyst**: Processes news sentiment and market perception
- **Report Writer**: Synthesizes all analysis into investment recommendations

## API Endpoints

- `POST /analyze` - Start stock analysis (returns request_id)
- `GET /analyze/<request_id>` - Get analysis results
- `GET /health` - Health check endpoint

## Requirements

All required packages are listed in `requirements.txt`