def generate_candidate_actions(context: dict) -> list:
    """
    Generates deterministic candidate actions based on event context.
    """
    candidates = []
    
    event_type = context.get("event_type", "")
    risk_level = context.get("risk_level", "NORMAL")
    loc_confidence = context.get("localization_confidence", 0.0)
    
    # Sensor Fault Handling
    if event_type == "SENSOR_FAULT":
        candidates.append({
            "action_type": "VERIFY",
            "title": f"Verify Sensor Health on {context.get('sensor_id', 'unknown')}",
            "reason": "AI has classified the anomaly as a possible sensor fault rather than physical flow loss.",
            "base_score": 50
        })
        return candidates # Don't recommend shutting valves for a busted sensor
        
    # Low confidence anomaly
    if loc_confidence < 0.5:
        candidates.append({
            "action_type": "VERIFY",
            "title": "Compare upstream and downstream flow",
            "reason": "Localization confidence is low. Verify deviation manually before targeted inspection.",
            "base_score": 60
        })
    else:
        # High confidence localization
        candidates.append({
            "action_type": "INVESTIGATE",
            "title": f"Inspect Segment {context.get('probable_segment', 'Unknown')}",
            "reason": "Localization confidence is high and excess flow persists.",
            "base_score": 80
        })
        
    # High Risk Escalations
    if risk_level in ["HIGH_RISK", "CRITICAL_RISK"]:
        candidates.append({
            "action_type": "ESCALATE",
            "title": "Notify Operations Supervisor",
            "reason": "Risk has breached High/Critical thresholds.",
            "base_score": 90
        })
        
        candidates.append({
            "action_type": "ISOLATE",
            "title": f"Prepare Isolation Procedure for {context.get('probable_segment', 'Unknown')}",
            "reason": "Risk is critical. Prepare for physical isolation to prevent further massive loss.",
            "base_score": 95
        })
        
    return candidates
