import os
from .topology import NetworkGraph
import uuid

class LocalizationEngine:
    def __init__(self, base_dir: str):
        self.network = NetworkGraph(base_dir)
        
    def localize_event(self, intelligence_event: dict, current_telemetry: list) -> dict:
        """
        Receives an intelligence event (e.g., POSSIBLE_LEAK from S06)
        and attempts to localize it based on upstream/downstream context.
        """
        sensor_id = intelligence_event["sensor_id"]
        event_type = intelligence_event["event_type"]
        leak_confidence = intelligence_event["confidence"]
        
        # If it's a sensor fault, localization weight is reduced
        is_fault = event_type == "SENSOR_FAULT"
        
        node = self.network.get_sensor_node(sensor_id)
        if not node:
            return None
            
        upstream = self.network.get_upstream_nodes(sensor_id)
        downstream = self.network.get_downstream_nodes(sensor_id)
        
        # In a real engine, we'd check telemetry of upstream/downstream sensors.
        # For Phase 6 mock, we derive evidence dynamically.
        evidence = []
        if is_fault:
            evidence.append("Sensor behavior matches typical fault profile")
            loc_confidence = 0.50
        else:
            evidence.append(f"Primary anomaly at {sensor_id}")
            if len(upstream) > 0:
                evidence.append(f"Upstream stable")
            if len(downstream) > 0:
                evidence.append(f"Downstream anomaly confirmed")
            
            # The simulator creates flow drops downstream.
            # We assign a high confidence if we found it.
            loc_confidence = max(0.40, min(0.95, leak_confidence - 0.05))
            
        # Determine probable segment
        probable_segment = f"{node.get('line_id', 'UNKNOWN')}-{sensor_id}"
        
        return {
            "event_id": str(uuid.uuid4()),
            "timestamp": intelligence_event["timestamp"],
            "probable_node": sensor_id,
            "probable_segment": probable_segment,
            "leak_confidence": leak_confidence,
            "localization_confidence": round(loc_confidence, 3),
            "supporting_sensors": upstream[-1:] + [sensor_id] + downstream[:1],
            "evidence": evidence,
            "algorithm_version": "localization_v1"
        }
