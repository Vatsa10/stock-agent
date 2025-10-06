'use client';

import { useState } from 'react';

interface AnalysisResult {
  report: string;
  loading: boolean;
  error: string | null;
  requestId?: string;
}

export default function Home() {
  const [stockSymbol, setStockSymbol] = useState('TSLA');
  const [companyName, setCompanyName] = useState('Tesla Inc.');
  const [result, setResult] = useState<AnalysisResult>({
    report: '',
    loading: false,
    error: null
  });

  const [retryCount, setRetryCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stockSymbol || !companyName) {
      setResult(prev => ({ ...prev, error: 'Please provide both stock symbol and company name' }));
      return;
    }

    setResult({ report: '', loading: true, error: null, requestId: undefined });
    setRetryCount(0);

    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: stockSymbol,
          company_name: companyName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.request_id) {
        // Start polling for results
        setResult(prev => ({ ...prev, requestId: data.request_id }));
        pollForResults(data.request_id);
      } else {
        throw new Error(data.error || 'Failed to start analysis');
      }
    } catch (error) {
      console.error('Error:', error);
      setResult(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred during analysis'
      }));
    }
  };

  const pollForResults = async (requestId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:5000/analyze/${requestId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'completed') {
          clearInterval(pollInterval);
          setResult({
            report: data.report,
            loading: false,
            error: null,
            requestId: requestId
          });
        } else if (data.status === 'error') {
          clearInterval(pollInterval);
          setResult(prev => ({
            ...prev,
            loading: false,
            error: data.error || 'Analysis failed'
          }));
        }
        // Continue polling if status is 'processing'
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollInterval);
        setResult(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to check analysis status'
        }));
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 5 minutes as a safety measure
    setTimeout(() => {
      clearInterval(pollInterval);
      if (result.loading) {
        setResult(prev => ({
          ...prev,
          loading: false,
          error: 'Analysis timed out. Please try again.'
        }));
      }
    }, 300000);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setResult({ report: '', loading: true, error: null });

    // Auto-retry after 2 seconds
    setTimeout(() => {
      const retryButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (retryButton) {
        retryButton.click();
      }
    }, 2000);
  };

  const formatReportContent = (reportData: any) => {
    if (typeof reportData === 'string') {
      // Legacy support for string reports
      const sections = reportData.split(/\n\s*\n/).filter(section => section.trim());
      return sections.map((section, index) => {
        if (section.includes('**') || section.toUpperCase() === section) {
          return (
            <div key={index} className="mb-6">
              <h3 className="text-2xl font-bold text-indigo-900 mb-3 border-b-2 border-indigo-200 pb-2">
                {section.replace(/\*\*/g, '').trim()}
              </h3>
            </div>
          );
        }
        const paragraphs = section.split('\n').filter(p => p.trim());
        return (
          <div key={index} className="mb-6">
            {paragraphs.map((paragraph, pIndex) => (
              <p key={pIndex} className="mb-4 text-gray-700 leading-relaxed text-lg">
                {paragraph.trim()}
              </p>
            ))}
          </div>
        );
      });
    }

    // Handle structured report data
    if (reportData && typeof reportData === 'object') {
      return (
        <div className="space-y-8">
          {/* Executive Summary */}
          <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-500">
            <h3 className="text-2xl font-bold text-indigo-900 mb-3">Executive Summary</h3>
            <p className="text-gray-800 text-lg leading-relaxed">{reportData.executive_summary}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Quantitative Analysis
              </h4>
              {reportData.quantitative_summary && (
                <p className="text-gray-700 mb-4">{reportData.quantitative_summary}</p>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {reportData.current_price && (
                  <div>
                    <span className="font-medium text-gray-600">Current Price:</span>
                    <span className="ml-2 text-gray-900">${reportData.current_price}</span>
                  </div>
                )}
                {reportData.week_high_52 && (
                  <div>
                    <span className="font-medium text-gray-600">52W High:</span>
                    <span className="ml-2 text-gray-900">${reportData.week_high_52}</span>
                  </div>
                )}
                {reportData.week_low_52 && (
                  <div>
                    <span className="font-medium text-gray-600">52W Low:</span>
                    <span className="ml-2 text-gray-900">${reportData.week_low_52}</span>
                  </div>
                )}
                {reportData.pe_ratio && (
                  <div>
                    <span className="font-medium text-gray-600">P/E Ratio:</span>
                    <span className="ml-2 text-gray-900">{reportData.pe_ratio}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Qualitative Analysis
              </h4>
              {reportData.qualitative_summary && (
                <p className="text-gray-700 mb-4">{reportData.qualitative_summary}</p>
              )}
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium text-gray-600">Sentiment:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    reportData.overall_sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    reportData.overall_sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reportData.overall_sentiment?.toUpperCase()}
                  </span>
                </div>
                {reportData.confidence_level && (
                  <div>
                    <span className="font-medium text-gray-600">Confidence:</span>
                    <span className="ml-2 text-gray-900">{reportData.confidence_level}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Investment Recommendation */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
            <h4 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Investment Recommendation
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className={`text-3xl font-bold mb-2 ${
                  reportData.investment_recommendation === 'Strong Buy' || reportData.investment_recommendation === 'Buy' ? 'text-green-600' :
                  reportData.investment_recommendation === 'Hold' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {reportData.investment_recommendation}
                </div>
                <p className="text-gray-700">{reportData.recommendation_rationale}</p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Risk Assessment</h5>
                <p className="text-gray-700">{reportData.risk_assessment}</p>
              </div>
            </div>
          </div>

          {/* Detailed Analysis Sections */}
          {reportData.key_risks && reportData.key_risks.length > 0 && (
            <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
              <h4 className="text-xl font-semibold text-red-900 mb-3">Key Risks</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-800">
                {reportData.key_risks.map((risk: string, index: number) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          {reportData.key_opportunities && reportData.key_opportunities.length > 0 && (
            <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
              <h4 className="text-xl font-semibold text-green-900 mb-3">Key Opportunities</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-800">
                {reportData.key_opportunities.map((opportunity: string, index: number) => (
                  <li key={index}>{opportunity}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    return <p className="text-gray-500">No report data available.</p>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 gradient-text">
            Multi-Agent Financial Analyst
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Enter a stock symbol and company name to start automated analysis using multiple AI agents.
            The process may take a few minutes as agents collaborate to generate your comprehensive report.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Real-time Analysis
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                AI-Powered Insights
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                Professional Reports
              </div>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="stockSymbol" className="block text-sm font-medium text-gray-900 mb-2">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  id="stockSymbol"
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g., TSLA, GOOGL, AAPL"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-900 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Tesla Inc., Alphabet Inc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={result.loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {result.loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Investment Report...
                </>
              ) : (
                'Generate Investment Report'
              )}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {result.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <div className="text-red-800">{result.error}</div>
                {retryCount < 3 && (
                  <button
                    onClick={handleRetry}
                    className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition-colors"
                  >
                    Retry Analysis
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result.report && (
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto animate-fade-in-up">
            <div className="flex items-center mb-8">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Investment Analysis Report</h2>
                <p className="text-gray-600">Comprehensive multi-agent financial analysis for {stockSymbol.toUpperCase()}</p>
              </div>
            </div>

            {/* Report Content with Enhanced Styling */}
            <div className="prose prose-lg max-w-none">
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="report-content text-gray-800 leading-relaxed font-medium">
                  {formatReportContent(result.report)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Report
              </button>
              <button
                onClick={() => {
                  if (typeof result.report === 'object') {
                    // Download structured report as JSON
                    const blob = new Blob([JSON.stringify(result.report, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${stockSymbol}_analysis_report.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } else {
                    // Fallback for string reports
                    const blob = new Blob([result.report], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${stockSymbol}_analysis_report.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l4-4m-4 4l-4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Download Report
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Financial Analysis Report - ${stockSymbol}`,
                      text: `Investment analysis for ${stockSymbol} by ${companyName}`,
                      url: window.location.href,
                    });
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Report
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {result.loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center text-indigo-600">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg font-medium">
                {retryCount > 0 ? `Retrying analysis (attempt ${retryCount + 1}/3)...` : 'Multi-agent system is running... Agents are collaborating to generate your report'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
