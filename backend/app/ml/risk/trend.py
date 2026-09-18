def evaluate_trend(current_risk: float, previous_risks: list) -> dict:
    """
    Computes slope and acceleration of risk to determine Trend State.
    """
    if not previous_risks or len(previous_risks) < 2:
        return {"trend_state": "STABLE", "slope": 0.0}
        
    # Simple linear approximation over last N readings
    y2 = current_risk
    y1 = previous_risks[-1]
    y0 = previous_risks[0]
    
    recent_slope = y2 - y1
    long_slope = (y2 - y0) / len(previous_risks)
    
    if recent_slope > 0.15:
        state = "RAPIDLY_RISING"
    elif recent_slope > 0.05 or long_slope > 0.02:
        state = "RISING"
    elif recent_slope < -0.10:
        state = "FALLING"
    else:
        state = "STABLE"
        
    return {"trend_state": state, "slope": round(recent_slope, 4)}
