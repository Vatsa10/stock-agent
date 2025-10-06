"""
Flask API for Multi-Agent Financial Analyst
Converts the Streamlit app to a REST API with threading support for better performance
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import queue
import time
import os
from dotenv import load_dotenv
from graph import app_graph

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Queue to handle analysis requests asynchronously
analysis_queue = queue.Queue()
analysis_results = {}

@app.route('/analyze', methods=['POST'])
def analyze_stock():
    """
    Synchronous endpoint for stock analysis that uses threading for background processing
    """
    try:
        data = request.get_json()

        if not data or 'symbol' not in data or 'company_name' not in data:
            return jsonify({
                'error': 'Missing required fields: symbol and company_name'
            }), 400

        stock_symbol = data['symbol']
        company_name = data['company_name']

        # Generate a unique request ID
        request_id = f"{stock_symbol}_{company_name}_{int(time.time())}"

        # Start analysis in background thread
        analysis_results[request_id] = {'status': 'processing', 'result': None, 'error': None}

        # Start background thread for analysis
        thread = threading.Thread(
            target=run_stock_analysis_background,
            args=(request_id, company_name, stock_symbol)
        )
        thread.daemon = True
        thread.start()

        return jsonify({
            'request_id': request_id,
            'status': 'processing',
            'message': 'Analysis started in background'
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/analyze/<request_id>', methods=['GET'])
def get_analysis_result(request_id):
    """
    Get the result of a stock analysis by request ID
    """
    if request_id not in analysis_results:
        return jsonify({
            'error': 'Request ID not found'
        }), 404

    result = analysis_results[request_id]

    if result['status'] == 'processing':
        return jsonify({
            'request_id': request_id,
            'status': 'processing',
            'message': 'Analysis still in progress'
        })

    elif result['status'] == 'completed':
        return jsonify({
            'request_id': request_id,
            'report': result['result'],
            'success': True,
            'status': 'completed'
        })

    else:  # error status
        return jsonify({
            'request_id': request_id,
            'error': result['error'],
            'success': False,
            'status': 'error'
        })

def run_stock_analysis_background(request_id: str, company_name: str, symbol: str):
    """
    Background function to run the stock analysis
    """
    try:
        # Update status to processing
        analysis_results[request_id] = {'status': 'processing', 'result': None, 'error': None}

        # Define the initial state to pass to the graph
        initial_state = {
            "company_name": company_name,
            "symbol": symbol,
            "messages": [], # Not used in this linear graph, but required by the state
        }

        # The .invoke() method executes the graph and returns the final state
        final_state = app_graph.invoke(initial_state)

        # Extract the final report from the state
        final_report = final_state.get("final_report", "No report generated.")

        # Convert Pydantic model to dictionary for JSON serialization
        if hasattr(final_report, 'model_dump'):
            # Pydantic v2
            final_report_dict = final_report.model_dump()
        else:
            # Pydantic v1 or dict
            final_report_dict = final_report.dict() if hasattr(final_report, 'dict') else final_report

        # Update results with success
        analysis_results[request_id] = {
            'status': 'completed',
            'result': final_report_dict,
            'error': None
        }

    except Exception as e:
        # Update results with error
        analysis_results[request_id] = {
            'status': 'error',
            'result': None,
            'error': f"An error occurred during the agent run: {e}"
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Multi-Agent Financial Analyst API'
    })

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True  # Enable multi-threading for better performance
    )
