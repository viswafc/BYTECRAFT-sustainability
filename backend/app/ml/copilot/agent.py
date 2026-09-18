from .intents import detect_intent
from .context import fetch_system_context

class CopilotAgent:
    def __init__(self):
        # We could initialize an LLM client here if we had API keys.
        # For the hackathon, we use deterministic RAG to guarantee a perfect response without failure.
        pass
        
    def generate_response(self, message: str) -> dict:
        intent = detect_intent(message)
        ctx = fetch_system_context()
        
        has_incident = ctx["has_active_incident"]
        decision = ctx["decision"]
        impact = ctx["impact"]
        risk = ctx["risk"]
        
        response = {
            "answer": "I do not have enough context to answer that right now.",
            "evidence": [],
            "confidence": 0.0,
            "data_freshness": "LIVE",
            "recommended_next_step": None
        }
        
        # Scenario 1: Plant is recovered
        if ctx["is_resolved"]:
            response["answer"] = "The plant is currently operating within expected baseline parameters. The last incident has been successfully resolved and flow has normalized."
            if decision and decision.get("expected_benefit"):
                response["evidence"] = [f"Intervention recovered {decision['expected_benefit']['water_loss_reduction_m3']} m³ of water."]
            response["confidence"] = 0.99
            return response
            
        # Scenario 2: No active incidents
        if not has_incident:
            response["answer"] = "The plant network is operating perfectly normally. There are no active anomalies or leaks detected."
            response["confidence"] = 0.99
            return response
            
        # Scenario 3: Active Incident Responses based on Intent
        if intent == "CURRENT_STATUS":
            response["answer"] = f"There is an active anomaly classified as {decision['priority']}. The risk level is {risk['state']}."
            response["confidence"] = 0.95
            
        elif intent == "INCIDENT_EXPLANATION":
            response["answer"] = f"The system classifies this as a probable leak based on persisting flow deviations and falling pressure. {decision['reason']}"
            response["evidence"] = decision.get("evidence", [])
            response["confidence"] = decision.get("confidence", 0.0)
            
        elif intent == "LEAK_LOCATION":
            seg = decision['title'].split(" ")[-1] if "P-" in decision['title'] else "Unknown"
            response["answer"] = f"The leak localization engine isolated the highest probability to {seg}. Upstream and downstream flow meters support this conclusion."
            response["confidence"] = decision.get("confidence", 0.0)
            
        elif intent == "WATER_LOSS":
            loss = impact["cumulative_loss_m3"]
            response["answer"] = f"Estimated observed loss since the incident started is {loss:.2f} m³."
            response["confidence"] = 0.90
            
        elif intent == "FINANCIAL_IMPACT":
            cost = impact["financial_impact"]["total_cost"]
            response["answer"] = f"The current estimated financial exposure for the lost water and associated energy costs is ₹{cost}."
            response["confidence"] = 0.92
            
        elif intent == "COST_OF_WAITING":
            cow = impact["cost_of_waiting"].get("1h", {})
            response["answer"] = f"If the current trajectory continues, waiting 1 hour will expose an additional {cow.get('volume_m3', 0)} m³ and cost an additional ₹{cow.get('total_cost', 0)}."
            response["confidence"] = 0.85
            
        elif intent == "RECOMMENDATION":
            response["answer"] = f"The Decision Engine recommends you {decision['action_type']} immediately. {decision['title']}."
            response["recommended_next_step"] = "Acknowledge the alert and simulate intervention."
            response["confidence"] = 0.98
            
        else:
            # Fallback for general questions during an incident
            response["answer"] = f"There is an active {decision['priority']} incident. I recommend you {decision['title']}."
            
        return response
