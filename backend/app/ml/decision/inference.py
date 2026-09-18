from .rules import generate_candidate_actions
from .urgency import determine_urgency

class DecisionEngine:
    def __init__(self):
        self.active_recommendations = {}
        
    def process_impact(self, impact_snapshot: dict, risk_snapshot: dict, loc_result: dict) -> dict:
        """
        Takes quantified impact and generates a prioritized recommendation.
        """
        event_id = impact_snapshot["event_id"]
        
        # Build context
        context = {
            "event_id": event_id,
            "event_type": loc_result.get("event_type", "UNKNOWN"),
            "risk_level": risk_snapshot.get("state", "NORMAL"),
            "risk_trend": risk_snapshot.get("trend", "STABLE"),
            "localization_confidence": loc_result.get("confidence", 0.0),
            "probable_segment": loc_result.get("probable_segment", "Unknown"),
            "water_at_risk_m3": impact_snapshot.get("cost_of_waiting", {}).get("1h", {}).get("volume_m3", 0.0),
            "financial_exposure": impact_snapshot.get("financial_impact", {}).get("total_cost", 0.0),
            "sensor_id": loc_result.get("sensor", "unknown")
        }
        
        # We don't spam new recommendations if one is already active and the risk level hasn't escalated.
        # But for this mock, we will always update the "current" recommendation state.
        
        candidates = generate_candidate_actions(context)
        if not candidates:
            return None
            
        # Select highest score action
        best_action = sorted(candidates, key=lambda x: x["base_score"], reverse=True)[0]
        
        priority, urgency = determine_urgency(context["risk_level"], context["risk_trend"])
        
        # Compile evidence strings
        evidence = [
            f"Risk is currently {context['risk_level']} and {context['risk_trend']}.",
            f"Localization confidence for {context['probable_segment']} is {int(context['localization_confidence']*100)}%.",
            f"Projected 1-hour exposure is ₹{context['financial_exposure']}."
        ]
        
        recommendation = {
            "event_id": event_id,
            "action_type": best_action["action_type"],
            "title": best_action["title"],
            "priority": priority,
            "urgency": urgency,
            "confidence": context["localization_confidence"],
            "reason": best_action["reason"],
            "evidence": evidence,
            "expected_benefit": {
                "water_loss_reduction_m3": context["water_at_risk_m3"],
                "estimated_cost_avoided": context["financial_exposure"]
            },
            "status": "NEW" if event_id not in self.active_recommendations else self.active_recommendations[event_id]["status"]
        }
        
        # If the impact engine says it's resolved, close the recommendation
        if impact_snapshot["status"] == "RESOLVED":
            recommendation["status"] = "COMPLETED"
            
        self.active_recommendations[event_id] = recommendation
        
        return recommendation
        
    def get_current(self):
        # Return the most critical active recommendation
        active = [r for r in self.active_recommendations.values() if r["status"] in ["NEW", "ACKNOWLEDGED"]]
        if not active:
            return None
        # Sort by P0 > P1 > P2
        return sorted(active, key=lambda x: x["priority"])[0]

    def set_status(self, event_id: str, status: str):
        if event_id in self.active_recommendations:
            self.active_recommendations[event_id]["status"] = status
            return True
        return False
