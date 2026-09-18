def calculate_severity(event_type: str, abs_deviation: float, persistence: str) -> str:
    """
    Determines severity of an incident based on the predicted event and magnitude/persistence.
    """
    if event_type in ['NORMAL_OPERATION', 'NORMAL_PRODUCTION_VARIATION', 'MAINTENANCE_EVENT']:
        return "LOW"
        
    if event_type == 'CRITICAL_LEAK':
        return "CRITICAL"
        
    if event_type == 'MAJOR_LEAK':
        if persistence == "HIGH":
            return "CRITICAL"
        return "HIGH"
        
    if event_type == 'GRADUAL_LEAK' or event_type == 'POSSIBLE_LEAK':
        if abs_deviation > 1000:
            return "HIGH"
        return "MEDIUM"
        
    if event_type == 'SENSOR_FAULT':
        return "MEDIUM"
        
    return "LOW"

def generate_evidence(features_dict: dict, expected_val: float) -> list:
    """
    Constructs a structured JSON evidence payload for the Explainability Engine.
    """
    evidence = []
    
    # 1. Flow Deviation
    if 'abs_deviation' in features_dict:
        dev = features_dict['abs_deviation']
        direction = "high" if dev > 0 else "low"
        if abs(dev) > 100: # Threshold for inclusion in evidence
            evidence.append({
                "feature": "flow_deviation_lph",
                "value": round(dev, 2),
                "direction": direction
            })
            
    # 2. Production Context
    if 'production_level' in features_dict:
        prod = features_dict['production_level']
        evidence.append({
            "feature": "production_level",
            "value": round(prod, 2),
            "direction": "normal"
        })
        
    # 3. Volatility
    if 'rolling_std_3' in features_dict and features_dict['rolling_std_3'] > 50:
        evidence.append({
            "feature": "flow_volatility",
            "value": round(features_dict['rolling_std_3'], 2),
            "direction": "high"
        })
        
    return evidence
