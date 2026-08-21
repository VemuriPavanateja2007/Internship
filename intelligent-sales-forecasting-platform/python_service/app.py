"""
Flask API Service for AI-Powered Sales Forecasting Platform
Uses Flask, Werkzeug, NumPy, and Scikit-Learn.
Runs on internal port 5001 or standalone mode.
"""

import os
import sys
import json
import logging
from typing import Dict, Any

try:
    from flask import Flask, request, jsonify
    from werkzeug.utils import secure_filename
    HAS_FLASK = True
except ImportError:
    HAS_FLASK = False

# Import ML Engine
from ml_engine import SalesForecastingEngine, DealScoringEngine, ScenarioSimulator, HAS_SKLEARN

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FlaskSalesAPI")

# Initialize models
forecast_engine = SalesForecastingEngine()
deal_engine = DealScoringEngine()
scenario_engine = ScenarioSimulator()

if HAS_FLASK:
    app = Flask(__name__)
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
    UPLOAD_FOLDER = '/tmp/sales_uploads'
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "Flask ML Predictive Sales Engine",
            "has_sklearn": HAS_SKLEARN,
            "has_flask": HAS_FLASK,
            "algorithms": [
                "RandomForestRegressor",
                "GradientBoostingRegressor",
                "RidgePolynomialRegression",
                "RandomForestClassifier",
                "HoltWintersDecomposition",
                "MonteCarloScenarioSimulator"
            ]
        })

    @app.route('/api/ml/forecast', methods=['POST'])
    def api_forecast():
        try:
            body = request.get_json(force=True) or {}
            historical_data = body.get("historicalData", [])
            horizon_months = int(body.get("horizonMonths", 6))
            model_type = body.get("modelType", "ensemble")
            confidence_level = float(body.get("confidenceLevel", 0.95))
            growth_driver_multiplier = float(body.get("growthDriverMultiplier", 1.0))

            res = forecast_engine.generate_sales_forecast(
                historical_data=historical_data,
                horizon_months=horizon_months,
                model_type=model_type,
                confidence_level=confidence_level,
                growth_driver_multiplier=growth_driver_multiplier
            )
            return jsonify(res)
        except Exception as e:
            logger.exception("Forecast API error")
            return jsonify({"error": str(e)}), 500

    @app.route('/api/ml/score-deals', methods=['POST'])
    def api_score_deals():
        try:
            body = request.get_json(force=True) or {}
            deals = body.get("deals", [])
            res = deal_engine.score_pipeline(deals)
            return jsonify(res)
        except Exception as e:
            logger.exception("Deal Scoring API error")
            return jsonify({"error": str(e)}), 500

    @app.route('/api/ml/simulate-scenarios', methods=['POST'])
    def api_simulate_scenarios():
        try:
            body = request.get_json(force=True) or {}
            baseline_revenue = float(body.get("baselineRevenue", 1200000))
            horizon_months = int(body.get("horizonMonths", 12))
            lead_vol = float(body.get("leadVolumeChangePct", 0.0))
            deal_size = float(body.get("dealSizeChangePct", 0.0))
            conv_lift = float(body.get("conversionRateLiftPct", 0.0))
            reps_delta = int(body.get("salesRepsDelta", 0))
            churn_pct = float(body.get("churnRatePct", 2.0))
            macro = float(body.get("macroMultiplier", 1.0))

            res = scenario_engine.simulate(
                baseline_revenue=baseline_revenue,
                horizon_months=horizon_months,
                lead_volume_change_pct=lead_vol,
                deal_size_change_pct=deal_size,
                conversion_rate_lift_pct=conv_lift,
                sales_reps_count_change=reps_delta,
                churn_rate_pct=churn_pct,
                macro_multiplier=macro
            )
            return jsonify(res)
        except Exception as e:
            logger.exception("Simulate API error")
            return jsonify({"error": str(e)}), 500

    @app.route('/api/ml/upload-dataset', methods=['POST'])
    def api_upload_dataset():
        try:
            if 'file' not in request.files:
                return jsonify({"error": "No file uploaded in request"}), 400
            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No file selected"}), 400

            filename = secure_filename(file.filename)
            save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(save_path)

            # Read content
            with open(save_path, 'r', encoding='utf-8', errors='ignore') as f:
                raw_text = f.read()

            # Parse lines (simple robust CSV parser)
            lines = [l.strip() for l in raw_text.strip().split('\n') if l.strip()]
            header = [c.strip().replace('"', '') for c in lines[0].split(',')]
            
            parsed_rows = []
            for line in lines[1:]:
                parts = [p.strip().replace('"', '') for p in line.split(',')]
                if len(parts) >= 2:
                    date_val = parts[0]
                    try:
                        rev_val = float(parts[1])
                        parsed_rows.append({"date": date_val, "revenue": rev_val})
                    except ValueError:
                        continue

            return jsonify({
                "filename": filename,
                "totalRecords": len(parsed_rows),
                "columns": header,
                "records": parsed_rows,
                "message": f"Successfully parsed {len(parsed_rows)} sales records using Werkzeug upload handler."
            })
        except Exception as e:
            logger.exception("Upload Dataset error")
            return jsonify({"error": str(e)}), 500


def run_cli_handler():
    """
    Direct CLI JSON pipeline handler for zero-overhead Node.js child_process bridging.
    Allows Node server to invoke Python ML engine directly with stdin/stdout JSON.
    """
    if len(sys.argv) < 2:
        return

    command = sys.argv[1]
    if command == "health":
        print(json.dumps({
            "status": "healthy",
            "has_sklearn": HAS_SKLEARN,
            "has_flask": HAS_FLASK
        }))
        return

    try:
        input_data = sys.stdin.read()
        payload = json.loads(input_data) if input_data else {}
    except Exception:
        payload = {}

    if command == "forecast":
        res = forecast_engine.generate_sales_forecast(
            historical_data=payload.get("historicalData", []),
            horizon_months=int(payload.get("horizonMonths", 6)),
            model_type=payload.get("modelType", "ensemble"),
            confidence_level=float(payload.get("confidenceLevel", 0.95)),
            growth_driver_multiplier=float(payload.get("growthDriverMultiplier", 1.0))
        )
        print(json.dumps(res))
    elif command == "score-deals":
        res = deal_engine.score_pipeline(payload.get("deals", []))
        print(json.dumps(res))
    elif command == "simulate":
        res = scenario_engine.simulate(
            baseline_revenue=float(payload.get("baselineRevenue", 1200000)),
            horizon_months=int(payload.get("horizonMonths", 12)),
            lead_volume_change_pct=float(payload.get("leadVolumeChangePct", 0.0)),
            deal_size_change_pct=float(payload.get("dealSizeChangePct", 0.0)),
            conversion_rate_lift_pct=float(payload.get("conversionRateLiftPct", 0.0)),
            sales_reps_count_change=int(payload.get("salesRepsDelta", 0)),
            churn_rate_pct=float(payload.get("churnRatePct", 2.0)),
            macro_multiplier=float(payload.get("macroMultiplier", 1.0))
        )
        print(json.dumps(res))
    elif command == "health":
        print(json.dumps({
            "status": "healthy",
            "has_sklearn": HAS_SKLEARN,
            "has_flask": HAS_FLASK
        }))
    else:
        print(json.dumps({"error": f"Unknown command {command}"}))


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] != "serve":
        run_cli_handler()
    else:
        port = int(os.environ.get("FLASK_PORT", 5001))
        logger.info(f"Starting Flask API Server on port {port}...")
        if HAS_FLASK:
            app.run(host="0.0.0.0", port=port, debug=False)
        else:
            logger.warning("Flask not installed yet, CLI bridging active.")
