def calculate_severity(event_type: str, deviation_pct: float, localization_confidence: float) -> dict:
    """
    Calculates operational severity (LOW, MEDIUM, HIGH, CRITICAL).
    """
    if event_type == "SENSOR_FAULT":
        return {"level": "LOW", "score": 0.1, "evidence": ["Severity suppressed due to sensor fault"]}
        
    if event_type in ["NORMAL_OPERATION", "NORMAL_PRODUCTION_VARIATION", "MAINTENANCE_EVENT"]:
        return {"level": "LOW", "score": 0.05, "evidence": ["Normal operation state"]}

    dev = abs(deviation_pct)
    
    score = 0.2
    evidence = []
    
    if dev > 0.40:
        score += 0.5
        evidence.append(f"Massive flow/pressure deviation ({dev*100:.1f}%)")
    elif dev > 0.15:
        score += 0.3
        evidence.append(f"Significant deviation ({dev*100:.1f}%)")
    else:
        evidence.append(f"Minor deviation ({dev*100:.1f}%)")
        
    if localization_confidence > 0.8:
        score += 0.2
        evidence.append("High spatial localization confidence")
        
    score = min(1.0, max(0.0, score))
    
    if score >= 0.8:
        level = "CRITICAL"
    elif score >= 0.5:
        level = "HIGH"
    elif score >= 0.3:
        level = "MEDIUM"
    else:
        level = "LOW"
        
    return {"level": level, "score": score, "evidence": evidence}
