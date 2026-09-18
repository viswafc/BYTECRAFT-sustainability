def detect_intent(message: str) -> str:
    """
    Very simple deterministic intent parser to route the Copilot logic
    without requiring an external LLM API key.
    """
    msg = message.lower()
    
    if any(k in msg for k in ["what's happening", "current status", "what is happening", "right now"]):
        return "CURRENT_STATUS"
        
    if any(k in msg for k in ["why", "evidence", "reason", "think it's a leak"]):
        return "INCIDENT_EXPLANATION"
        
    if any(k in msg for k in ["where", "location", "segment", "which pipe"]):
        return "LEAK_LOCATION"
        
    if any(k in msg for k in ["how much water", "volume lost", "lost"]):
        return "WATER_LOSS"
        
    if any(k in msg for k in ["financial", "money", "exposure", "cost"]):
        return "FINANCIAL_IMPACT"
        
    if any(k in msg for k in ["wait", "30 min", "cost of waiting"]):
        return "COST_OF_WAITING"
        
    if any(k in msg for k in ["what should i do", "recommendation", "action", "next"]):
        return "RECOMMENDATION"
        
    return "UNKNOWN"
