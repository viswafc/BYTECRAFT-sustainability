def calculate_water_risk(telemetry: list, probable_node: str) -> dict:
    """
    Computes excess water currently at risk.
    """
    # Find the telemetry reading for the probable node
    target_tel = next((t for t in telemetry if t["sensor_id"] == probable_node), None)
    
    if not target_tel or "expected_value_ai" not in target_tel:
        return {"current_excess_flow_lph": 0.0, "estimated_water_at_risk_day": 0.0}
        
    actual = target_tel["value"]
    expected = target_tel["expected_value_ai"]
    
    # We only care about excess flow, or if it's pressure we can't easily quantify volumetric loss directly 
    # without a physical model, so we mock volumetric impact if it's a flow sensor.
    if target_tel["sensor_type"] == "flow" and actual > expected:
        excess_lph = actual - expected
    else:
        # Mock assumption for pressure drops if flow isn't available
        excess_lph = expected * abs(target_tel["deviation_pct_ai"]) if target_tel.get("deviation_pct_ai", 0) > 0.1 else 0.0
        
    excess_lph = max(0.0, float(excess_lph))
    
    return {
        "current_excess_flow_lph": round(excess_lph, 2),
        "estimated_water_at_risk_day": round(excess_lph * 24, 2)
    }
