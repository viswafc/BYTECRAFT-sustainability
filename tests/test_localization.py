import os
import sys

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "app")))

from network.topology import NetworkGraph
from network.localization import LocalizationEngine

def test_topology_loader():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "app", "network"))
    graph = NetworkGraph(base_dir)
    
    assert len(graph.topology.nodes) > 0
    assert len(graph.topology.edges) > 0
    
    # Check if SENS-P1-L-CA-FLO-1 is in nodes
    assert graph.get_sensor_node("SENS-P1-L-CA-FLO-1") is not None
    
    # Check downstream
    downstream = graph.get_downstream_nodes("MAIN_TANK")
    assert "SENS-P1-L-CA-FLO-1" in downstream

def test_localization_logic():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "app", "network"))
    engine = LocalizationEngine(base_dir)
    
    mock_event = {
        "sensor_id": "SENS-VA-L-PB-FLO-1",
        "event_type": "POSSIBLE_LEAK",
        "confidence": 0.95,
        "timestamp": "2024-01-01T12:00:00Z"
    }
    
    mock_telemetry = [] # Not deeply used by mock logic yet
    
    res = engine.localize_event(mock_event, mock_telemetry)
    
    assert res is not None
    assert res["probable_node"] == "SENS-VA-L-PB-FLO-1"
    assert res["probable_segment"] == "L-PB-SENS-VA-L-PB-FLO-1"
    assert res["localization_confidence"] >= 0.40
    assert "SENS-VA-L-PB-FLO-1" in res["supporting_sensors"]
    
def test_fault_localization():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "app", "network"))
    engine = LocalizationEngine(base_dir)
    
    mock_event = {
        "sensor_id": "SENS-VA-L-PB-FLO-1",
        "event_type": "SENSOR_FAULT",
        "confidence": 0.99,
        "timestamp": "2024-01-01T12:00:00Z"
    }
    
    res = engine.localize_event(mock_event, [])
    assert res is not None
    assert res["localization_confidence"] == 0.50
    assert "Sensor behavior matches typical fault profile" in res["evidence"]
    
if __name__ == "__main__":
    test_topology_loader()
    test_localization_logic()
    test_fault_localization()
    print("All localization tests passed!")
