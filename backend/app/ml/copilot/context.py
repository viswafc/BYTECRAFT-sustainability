def fetch_system_context():
    """
    Retrieves the actual live state from the centralized simulator state.
    """
    from backend.app.simulator.api import simulator_state
    
    # Extract states from memory
    decision_engine = simulator_state.get("decision_engine")
    active_decision = decision_engine.get_current() if decision_engine else None
    
    last_impact = simulator_state.get("last_impact")
    last_risk = simulator_state.get("last_risk")
    
    return {
        "has_active_incident": active_decision is not None and active_decision["status"] != "COMPLETED",
        "decision": active_decision,
        "impact": last_impact,
        "risk": last_risk,
        "is_resolved": active_decision is not None and active_decision["status"] == "COMPLETED"
    }
