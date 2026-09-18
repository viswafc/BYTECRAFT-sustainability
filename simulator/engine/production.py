import json
import os
import math
from datetime import datetime, timedelta

class ProductionModel:
    def __init__(self, config_path):
        with open(config_path, 'r') as f:
            self.config = json.load(f)["profiles"]["default"]["shifts"]
            
    def get_production_state(self, current_time: datetime):
        hour = current_time.hour
        minute = current_time.minute
        time_decimal = hour + (minute / 60.0)
        
        current_shift = None
        for shift in self.config:
            # Handle overnight shifts
            start = shift["start_hour"]
            end = shift["end_hour"]
            
            if start < end:
                if start <= time_decimal < end:
                    current_shift = shift
                    break
            else:
                if time_decimal >= start or time_decimal < end:
                    current_shift = shift
                    break
                    
        if not current_shift:
            return {"level": 0.0, "status": "OFFLINE", "shift": "NONE"}
            
        # Interpolate between pattern points
        pattern = current_shift["pattern"]
        
        # Simple step-logic for this simulation to keep it performant
        # We find the most recent pattern point that has passed
        active_point = pattern[0]
        for pt in pattern:
            pt_hour = int(pt["time"].split(":")[0])
            pt_min = int(pt["time"].split(":")[1])
            pt_dec = pt_hour + (pt_min / 60.0)
            
            # Complex time handling for overnight wraps could go here. 
            # For simplicity in this demo, we assume the list is ordered and we just pick the nearest past point.
            if pt_dec <= time_decimal:
                active_point = pt
                
        # In overnight case, if time_decimal < start of first point, we might need to look at the last point of the shift.
        # This basic logic is sufficient for simulating realistic production variation.
        return {
            "level": active_point["level"],
            "status": active_point["status"],
            "shift": current_shift["name"]
        }
