import uuid
from .severity import calculate_severity
from .risk_score import calculate_risk_score
from .trend import evaluate_trend
from .forecasting import exponential_moving_average_forecast, estimate_time_to_critical
from .escalation import determine_early_warning_state
from .water_risk import calculate_water_risk

class RiskEngine:
    def __init__(self):
        # We maintain a brief history in memory for trend calculations
        # In a real distributed system, we'd pull this from Redis or Time-series DB
        self.history = {}

    def process_localization(self, localization: dict, all_telemetry: list) -> dict:
        """
        Main inference entry point for the Risk Engine.
        Called after Localization completes.
        """
        sensor_id = localization["probable_node"]
        event_id = localization["event_id"]
        
        if sensor_id not in self.history:
            self.history[sensor_id] = {
                "risk_scores": [],
                "state": "NORMAL"
            }
            
        history = self.history[sensor_id]
        
        # 1. Look up target telemetry to find dev
        target_tel = next((t for t in all_telemetry if t["sensor_id"] == sensor_id), None)
        dev_pct = target_tel["deviation_pct_ai"] if target_tel and "deviation_pct_ai" in target_tel else 0.0
        event_type = target_tel["event_type"] if target_tel else "UNKNOWN"
        
        # 2. Severity
        sev = calculate_severity(event_type, dev_pct, localization["localization_confidence"])
        
        # 3. Risk Score
        risk_score = calculate_risk_score(sev["score"], len(history["risk_scores"]), localization["localization_confidence"])
        
        # Update history window (keep last 10 ticks for trend)
        history["risk_scores"].append(risk_score)
        if len(history["risk_scores"]) > 10:
            history["risk_scores"].pop(0)
            
        # 4. Trend
        trend = evaluate_trend(risk_score, history["risk_scores"])
        
        # 5. Early Warning State
        state = determine_early_warning_state(risk_score, history["state"])
        history["state"] = state
        
        # 6. Forecasting & TTC
        forecast = exponential_moving_average_forecast(risk_score, trend["slope"])
        ttc = estimate_time_to_critical(risk_score, trend["slope"])
        
        # 7. Water at Risk
        water = calculate_water_risk(all_telemetry, sensor_id)
        
        return {
            "event_id": event_id,
            "timestamp": localization["timestamp"],
            "risk_score": round(risk_score, 3),
            "severity": sev["level"],
            "trend": trend["trend_state"],
            "state": state,
            "water_at_risk_lph": water["current_excess_flow_lph"],
            "water_at_risk_day": water["estimated_water_at_risk_day"],
            "time_to_critical": ttc,
            "forecast": forecast,
            "evidence": sev["evidence"]
        }
