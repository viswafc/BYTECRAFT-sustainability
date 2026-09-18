def calculate_financial_impact(volume_m3: float, profile: dict) -> dict:
    """
    Calculates total and broken-down financial impact based on a cost profile.
    """
    water_cost = volume_m3 * profile.get("raw_water_cost", 0.0)
    treatment_cost = volume_m3 * profile.get("treatment_cost", 0.0)
    wastewater_cost = volume_m3 * profile.get("wastewater_cost", 0.0)
    energy_cost = volume_m3 * profile.get("energy_cost", 0.0)
    
    total = water_cost + treatment_cost + wastewater_cost + energy_cost
    
    return {
        "water_cost": round(water_cost, 2),
        "treatment_cost": round(treatment_cost, 2),
        "wastewater_cost": round(wastewater_cost, 2),
        "energy_cost": round(energy_cost, 2),
        "total_cost": round(total, 2)
    }

def get_demo_cost_profile() -> dict:
    return {
        "name": "Demo Industrial Plant",
        "raw_water_cost": 80.0,
        "treatment_cost": 45.0,
        "wastewater_cost": 25.0,
        "energy_cost": 12.0,
        "operational_cost": 0.0,
        "currency": "INR"
    }
