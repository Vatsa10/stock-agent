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
              <h3 className="text-2xl font-bold text-white mb-3 border-b-2 border-white/30 pb-2">
                {section.replace(/\*\*/g, '').trim()}
              </h3>
            </div>
          );
        }
        const paragraphs = section.split('\n').filter(p => p.trim());
        return (
          <div key={index} className="mb-6">
            {paragraphs.map((paragraph, pIndex) => (
              <p key={pIndex} className="mb-4 text-gray-200 leading-relaxed text-lg">
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
          <div className="bg-black/20 backdrop-blur-lg p-6 rounded-lg border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-3">Executive Summary</h3>
            <p className="text-gray-200 text-lg leading-relaxed">{reportData.executive_summary}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/20 backdrop-blur-lg p-6 rounded-lg shadow-sm border border-white/10">
              <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Quantitative Analysis
              </h4>
              {reportData.quantitative_summary && (
                <p className="text-gray-200 mb-4">{reportData.quantitative_summary}</p>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {reportData.current_price && (
                  <div>
                    <span className="font-medium text-gray-300">Current Price:</span>
                    <span className="ml-2 text-white">${reportData.current_price}</span>
                  </div>
                )}
                {reportData.week_high_52 && (
                  <div>
                    <span className="font-medium text-gray-300">52W High:</span>
                    <span className="ml-2 text-white">${reportData.week_high_52}</span>
                  </div>
                )}
                {reportData.week_low_52 && (
                  <div>
                    <span className="font-medium text-gray-300">52W Low:</span>
                    <span className="ml-2 text-white">${reportData.week_low_52}</span>
                  </div>
                )}
                {reportData.pe_ratio && (
                  <div>
                    <span className="font-medium text-gray-300">P/E Ratio:</span>
                    <span className="ml-2 text-white">{reportData.pe_ratio}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-lg p-6 rounded-lg shadow-sm border border-white/10">
              <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Qualitative Analysis
              </h4>
              {reportData.qualitative_summary && (
                <p className="text-gray-200 mb-4">{reportData.qualitative_summary}</p>
              )}
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium text-gray-300">Sentiment:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    reportData.overall_sentiment === 'positive' ? 'bg-green-900/30 text-green-300 border border-green-800/50' :
                    reportData.overall_sentiment === 'negative' ? 'bg-red-900/30 text-red-300 border border-red-800/50' :
                    'bg-gray-700/30 text-gray-300 border border-gray-600/50'
                  }`}>
                    {reportData.overall_sentiment?.toUpperCase()}
                  </span>
                </div>
                {reportData.confidence_level && (
                  <div>
                    <span className="font-medium text-gray-300">Confidence:</span>
                    <span className="ml-2 text-white">{reportData.confidence_level}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Investment Recommendation */}
          <div className="bg-gradient-to-r from-black/20 to-white/5 backdrop-blur-lg p-6 rounded-lg border border-white/10">
            <h4 className="text-2xl font-bold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Investment Recommendation
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className={`text-3xl font-bold mb-2 ${
                  reportData.investment_recommendation === 'Strong Buy' || reportData.investment_recommendation === 'Buy' ? 'text-green-400' :
                  reportData.investment_recommendation === 'Hold' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {reportData.investment_recommendation}
                </div>
                <p className="text-gray-200">{reportData.recommendation_rationale}</p>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-2">Risk Assessment</h5>
                <p className="text-gray-200">{reportData.risk_assessment}</p>
              </div>
            </div>
          </div>

          {/* Detailed Analysis Sections */}
          {reportData.key_risks && reportData.key_risks.length > 0 && (
            <div className="bg-red-900/20 backdrop-blur-lg p-6 rounded-lg border border-red-800/30">
              <h4 className="text-xl font-semibold text-white mb-3">Key Risks</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-200">
                {reportData.key_risks.map((risk: string, index: number) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          {reportData.key_opportunities && reportData.key_opportunities.length > 0 && (
            <div className="bg-green-900/20 backdrop-blur-lg p-6 rounded-lg border border-green-800/30">
              <h4 className="text-xl font-semibold text-white mb-3">Key Opportunities</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-200">
                {reportData.key_opportunities.map((opportunity: string, index: number) => (
                  <li key={index}>{opportunity}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    return <p className="text-gray-400">No report data available.</p>;
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl font-bold text-white mb-4">
            Multi-Agent Financial Analyst
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Enter a stock symbol and company name to start automated analysis using multiple AI agents.
            The process may take a few minutes as agents collaborate to generate your comprehensive report.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                Real-time Analysis
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                AI-Powered Insights
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                Professional Reports
              </div>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-8 max-w-2xl mx-auto border border-white/20 shadow-white/10 relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 border border-transparent rounded-2xl" style={{
              background: 'linear-gradient(45deg, rgba(255,0,0,0.15), rgba(0,255,0,0.15), rgba(0,0,255,0.15), rgba(255,0,0,0.15))',
              backgroundSize: '300% 300%',
              animation: 'rgbFlow 3s ease infinite',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
              padding: '2px'
            }}></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="stockSymbol" className="block text-sm font-medium text-white mb-2">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  id="stockSymbol"
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g., TSLA, GOOGL, AAPL"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300 text-white placeholder-gray-300 backdrop-blur-sm"
                />
              </div>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-white mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Tesla Inc., Alphabet Inc."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300 text-white placeholder-gray-300 backdrop-blur-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={result.loading}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center border border-white/30 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10"
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
          <div className="bg-red-900/30 backdrop-blur-lg border border-red-800/50 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <div className="text-red-200">{result.error}</div>
                {retryCount < 3 && (
                  <button
                    onClick={handleRetry}
                    className="mt-2 text-sm bg-red-800/50 hover:bg-red-700/50 text-red-200 px-3 py-1 rounded transition-colors"
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
          <div className="bg-black/20 backdrop-blur-lg rounded-xl shadow-lg p-8 max-w-5xl mx-auto animate-fade-in-up border border-white/10">
            <div className="flex items-center mb-8">
              <div className="bg-white/10 p-3 rounded-full mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Investment Analysis Report</h2>
                <p className="text-gray-300">Comprehensive multi-agent financial analysis for {stockSymbol.toUpperCase()}</p>
              </div>
            </div>

            {/* Report Content with Enhanced Styling */}
            <div className="prose prose-lg max-w-none">
              <div className="bg-black/10 backdrop-blur-sm rounded-lg border border-white/5 p-6 shadow-sm">
                <div className="report-content text-gray-200 leading-relaxed font-medium">
                  {formatReportContent(result.report)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => window.print()}
                className="bg-white text-black font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center hover:bg-gray-200"
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
                className="bg-white text-black font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center hover:bg-gray-200"
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
                className="bg-white text-black font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center hover:bg-gray-200"
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
            <div className="inline-flex items-center text-white">
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