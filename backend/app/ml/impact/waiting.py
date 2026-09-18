from .cost import calculate_financial_impact

def project_cost_of_waiting(current_excess_lph: float, risk_slope: float, profile: dict) -> dict:
    """
    Extrapolates volume and financial cost across horizons.
    Incorporates Risk Engine trend (if risk is escalating, future flow is modeled to increase).
    """
    horizons = [10, 30, 60, 360, 1440] # minutes
    
    # Simple linear heuristic: flow worsens proportionally to risk acceleration
    # If slope is positive, we assume the leak is expanding.
    flow_acceleration = max(0.0, min(0.2, risk_slope)) 
    
    projections = {}
    
    for m in horizons:
        # Average flow over the period (assuming linear increase)
        # Final flow = current + (current * acceleration * ticks)
        # Average flow = (current + final) / 2
        
        final_flow = current_excess_lph * (1.0 + (flow_acceleration * m))
        avg_flow_lph = (current_excess_lph + final_flow) / 2.0
        
        vol_m3 = (avg_flow_lph / 60.0 / 1000.0) * m
        
        financials = calculate_financial_impact(vol_m3, profile)
        
        key_name = f"{m}m" if m < 60 else (f"{m//60}h" if m < 1440 else "24h")
        
        projections[key_name] = {
            "volume_m3": round(vol_m3, 3),
            "total_cost": financials["total_cost"]
        }
        
    return projections
