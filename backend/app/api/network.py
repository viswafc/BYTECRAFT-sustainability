from fastapi import APIRouter
from backend.app.network.topology import NetworkGraph
import os

router = APIRouter()
base_dir = os.path.dirname(__file__)

network_graph = NetworkGraph(base_dir)

@router.get("/api/network/topology")
def get_topology():
    # Convert sets/objects to dicts
    nodes = [n.dict() for n in network_graph.topology.nodes]
    edges = [e.dict() for e in network_graph.topology.edges]
    return {
        "nodes": nodes,
        "edges": edges
    }

@router.get("/api/localization/current")
def get_current_localization():
    from backend.app.simulator.api import simulator_state
    if "last_localization" in simulator_state:
        return simulator_state["last_localization"]
    return None
