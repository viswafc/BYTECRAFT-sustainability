def exponential_moving_average_forecast(current_risk: float, slope: float) -> list:
    """
    Forecasts short-term risk using EMA + Slope Extrapolation.
    """
    forecasts = []
    
    # Cap maximum slope extrapolation to prevent exploding projections
    damped_slope = max(-0.1, min(0.1, slope))
    
    horizons = [1, 2, 6, 12, 24] # hours
    # Assuming simulator ticks are minutes, but we project hours.
    
    for h in horizons:
        # Simple damping factor: further out = less slope impact
        damp = 1.0 / (1.0 + (h * 0.1))
        projected = current_risk + (damped_slope * h * 10 * damp)
        projected = max(0.0, min(1.0, projected))
        
        # Uncertainty bounds widen over time
        uncertainty = 0.05 * h
        lower = max(0.0, projected - uncertainty)
        upper = min(1.0, projected + uncertainty)
        
        conf = "HIGH" if h <= 2 else ("MEDIUM" if h <= 6 else "LOW")
        
        forecasts.append({
            "horizon_hours": h,
            "predicted_risk": round(projected, 3),
            "lower_bound": round(lower, 3),
            "upper_bound": round(upper, 3),
            "confidence": conf
        })
        
    return forecasts

def estimate_time_to_critical(current_risk: float, slope: float) -> str:
    if current_risk >= 0.85:
        return "CRITICAL NOW"
    if slope <= 0.005:
        return "Insufficient evidence"
        
    # How many ticks to reach 0.85?
    ticks_to_crit = (0.85 - current_risk) / slope
    # Assuming 1 tick = 1 minute in sim time
    if ticks_to_crit < 0:
        return "Insufficient evidence"
        
    hours = int(ticks_to_crit // 60)
    minutes = int(ticks_to_crit % 60)
    
    if hours > 24:
        return "> 24h"
        
    return f"{hours:02d}h {minutes:02d}m"
