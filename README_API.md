# Multi-Agent Financial Analyst

A modern web application for automated financial analysis using multiple AI agents. This application combines a Next.js frontend with a Flask API backend for optimal performance and user experience.

## Features

- **Multi-Agent System**: Uses LangGraph to orchestrate multiple specialized AI agents
- **Real-time Analysis**: Async Flask API for fast, non-blocking stock analysis
- **Modern UI**: Beautiful Next.js frontend with responsive design
- **Error Handling**: Comprehensive error handling with retry functionality
- **Loading States**: Real-time progress indicators during analysis

## Architecture

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Flask API with async/await support
- **AI Agents**: LangGraph orchestration of specialized agents
  - Data Fetcher Agent
  - Quantitative Analyst Agent
  - Qualitative Analyst Agent
  - Report Writer Agent

## Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Node.js dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## Running the Application

### Option 1: Using the Startup Script (Recommended)

#### Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

#### Windows:
```batch
start.bat
```

This will start both the Flask API (port 5000) and Next.js frontend (port 3000) simultaneously.

### Option 2: Manual Start

#### Start the Flask API:
```bash
python api.py
```

#### Start the Next.js frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a stock symbol (e.g., "TSLA") and company name (e.g., "Tesla Inc.")
3. Click "Generate Investment Report"
4. The multi-agent system will analyze the stock and generate a comprehensive report

## API Endpoints

- `POST /analyze`: Start stock analysis
  - Request body: `{"symbol": "TSLA", "company_name": "Tesla Inc."}`
  - Response: `{"report": "...", "success": true}`

- `GET /health`: Health check endpoint

## Development

### Project Structure

```
stock-agent/
├── agents/              # AI agent definitions
├── tools/               # Financial data tools
├── graph.py             # LangGraph workflow definition
├── api.py               # Flask API server
├── app.py               # Original Streamlit app (legacy)
├── frontend/            # Next.js application
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx    # Main UI component
│   │       └── layout.tsx  # App layout
│   └── package.json
├── requirements.txt     # Python dependencies
└── start.bat/sh         # Startup scripts
```

### Adding New Features

1. **New AI Agents**: Add agent definitions in `agents/` directory
2. **New Tools**: Add financial tools in `tools/` directory
3. **UI Components**: Modify `frontend/src/app/page.tsx`
4. **API Endpoints**: Extend `api.py` with new routes

## Environment Variables

Make sure your `.env` file contains the necessary API keys for:
- Alpha Vantage (stock data)
- News API (news data)
- Google Generative AI (LLM)

## Performance Optimizations

- **Async Processing**: Flask API uses async/await for non-blocking operations
- **Thread Pools**: Long-running analysis runs in separate threads
- **Connection Pooling**: Efficient HTTP client management
- **Caching**: Response caching for frequently requested data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
