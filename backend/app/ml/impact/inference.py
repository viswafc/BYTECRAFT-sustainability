from .water_loss import calculate_cumulative_loss
from .cost import calculate_financial_impact, get_demo_cost_profile
from .waiting import project_cost_of_waiting
from datetime import datetime

class ImpactEngine:
    def __init__(self):
        self.events = {}
        self.profile = get_demo_cost_profile()
        
    def process_risk(self, risk_snapshot: dict) -> dict:
        """
        Takes the output of the RiskEngine and updates continuous Impact state.
        """
        event_id = risk_snapshot["event_id"]
        
        # 1. Check if event is resolved
        # We consider it resolved if the baseline deviation (water_at_risk_lph) hits ~0 and risk state drops.
        if risk_snapshot["water_at_risk_lph"] < 1.0 and risk_snapshot["state"] in ["NORMAL", "WATCH"]:
            if event_id in self.events:
                ev = self.events[event_id]
                ev["status"] = "RESOLVED"
                
                # Calculate Avoided Loss
                # Hypothetical: if they hadn't fixed it, it would have run for another 6h at peak flow.
                # Avoided Volume = (peak_lph / 60 / 1000) * 360 mins
                avoided_vol = (ev["peak_excess_lph"] / 60.0 / 1000.0) * 360
                ev["avoided_loss_m3"] = round(avoided_vol, 2)
                
                fin = calculate_financial_impact(avoided_vol, self.profile)
                ev["avoided_loss_cost"] = fin["total_cost"]
                
                return ev
            return None
            
        # 2. Start or update event
        if event_id not in self.events:
            self.events[event_id] = {
                "event_id": event_id,
                "start_time": risk_snapshot["timestamp"],
                "duration_minutes": 0.0,
                "cumulative_loss_m3": 0.0,
                "peak_excess_lph": 0.0,
                "status": "ACTIVE"
            }
            
        ev = self.events[event_id]
        
        # 3. Accumulate Loss
        ev = calculate_cumulative_loss(ev, risk_snapshot["water_at_risk_lph"], tick_duration_minutes=1.0)
        
        # 4. Financial Impact of Cumulative Loss
        financials = calculate_financial_impact(ev["cumulative_loss_m3"], self.profile)
        
        # 5. Cost of Waiting (using trend slope from RiskEngine)
        trend_slope = 0.0
        # Quick hack to map Risk Engine trend string back to a heuristic slope if slope wasn't passed down.
        if risk_snapshot["trend"] == "RAPIDLY_RISING": trend_slope = 0.1
        elif risk_snapshot["trend"] == "RISING": trend_slope = 0.05
        
        waiting_proj = project_cost_of_waiting(risk_snapshot["water_at_risk_lph"], trend_slope, self.profile)
        
        return {
            "event_id": event_id,
            "timestamp": risk_snapshot["timestamp"],
            "duration_minutes": ev["duration_minutes"],
            "cumulative_loss_m3": round(ev["cumulative_loss_m3"], 3),
            "financial_impact": financials,
            "cost_of_waiting": waiting_proj,
            "status": ev["status"]
        }
