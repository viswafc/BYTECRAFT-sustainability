def calculate_cumulative_loss(event_state: dict, current_excess_lph: float, tick_duration_minutes: float = 1.0) -> dict:
    """
    Integrates the excess flow over the tick duration to update cumulative loss.
    L/h to m3 per tick.
    """
    # 1 L = 0.001 m3
    # L/h -> L/min = L/h / 60
    # L/min -> m3/min = (L/h / 60) * 0.001
    
    excess_l_per_min = current_excess_lph / 60.0
    excess_m3_per_min = excess_l_per_min / 1000.0
    
    tick_loss_m3 = excess_m3_per_min * tick_duration_minutes
    
    # Update event state
    event_state["duration_minutes"] += tick_duration_minutes
    event_state["cumulative_loss_m3"] += tick_loss_m3
    
    # Track peaks
    if current_excess_lph > event_state["peak_excess_lph"]:
        event_state["peak_excess_lph"] = current_excess_lph
        
    return event_state
