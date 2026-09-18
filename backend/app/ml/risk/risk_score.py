def calculate_risk_score(severity_score: float, persistence_ticks: int, localization_confidence: float) -> float:
    """
    Computes a continuous risk score 0.0 -> 1.0.
    """
    # Base risk is heavily tied to severity
    base_risk = severity_score
    
    # Persistence modifier (if it persists for 5+ ticks, risk goes up)
    persistence_modifier = min(0.2, persistence_ticks * 0.02)
    
    # Uncertainty penalty (if we aren't sure where it is, risk is slightly mitigated from being "catastrophic")
    # Actually, if we don't know where it is, risk of severe impact might be HIGHER or LOWER depending on domain.
    # Let's say high confidence increases actionable risk.
    loc_modifier = (localization_confidence - 0.5) * 0.1
    
    score = base_risk + persistence_modifier + loc_modifier
    return max(0.0, min(1.0, score))
