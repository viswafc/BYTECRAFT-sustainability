def determine_early_warning_state(current_risk: float, previous_state: str) -> str:
    """
    State machine for Escalation Engine with Hysteresis.
    """
    # Define thresholds
    T_CRIT = 0.85
    T_HIGH = 0.65
    T_WARN = 0.40
    T_WATCH = 0.20
    
    # Hysteresis (must drop 5% below threshold to de-escalate)
    H = 0.05
    
    if current_risk >= T_CRIT:
        return "CRITICAL_RISK"
        
    if previous_state == "CRITICAL_RISK" and current_risk > (T_CRIT - H):
        return "CRITICAL_RISK"
        
    if current_risk >= T_HIGH:
        return "HIGH_RISK"
        
    if previous_state == "HIGH_RISK" and current_risk > (T_HIGH - H):
        return "HIGH_RISK"
        
    if current_risk >= T_WARN:
        return "EARLY_WARNING"
        
    if previous_state == "EARLY_WARNING" and current_risk > (T_WARN - H):
        return "EARLY_WARNING"
        
    if current_risk >= T_WATCH:
        return "WATCH"
        
    if previous_state == "WATCH" and current_risk > (T_WATCH - H):
        return "WATCH"
        
    return "NORMAL"
