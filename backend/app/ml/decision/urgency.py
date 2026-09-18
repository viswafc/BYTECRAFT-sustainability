def determine_urgency(risk_level: str, risk_trend: str) -> tuple:
    """
    Computes Priority and Urgency string based on risk state and trend.
    """
    priority = "P4"
    urgency = "MONITOR"
    
    if risk_level == "CRITICAL_RISK":
        priority = "P0"
        urgency = "NOW"
    elif risk_level == "HIGH_RISK":
        priority = "P1"
        urgency = "WITHIN_15_MIN"
        if risk_trend == "RAPIDLY_RISING":
            urgency = "NOW"
    elif risk_level == "EARLY_WARNING":
        priority = "P2"
        urgency = "WITHIN_1_HOUR"
    elif risk_level == "WATCH":
        priority = "P3"
        urgency = "NEXT_SHIFT"
        
    return priority, urgency
