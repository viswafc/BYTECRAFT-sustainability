import json
import os
import networkx as nx
from .schemas import NodeSchema, EdgeSchema, TopologySchema

def load_topology(base_dir: str) -> TopologySchema:
    plant_path = os.path.abspath(os.path.join(base_dir, "..", "..", "..", "simulator", "config", "plant.json"))
    with open(plant_path, "r") as f:
        plant_config = json.load(f)
        
    nodes = []
    edges = []
    
    # Add MAIN_TANK
    nodes.append(NodeSchema(id="MAIN_TANK", type="tank", name="Main Tank"))
    
    for zone in plant_config["topology"]["zones"]:
        zone_id = zone["zone_id"]
        for line in zone["lines"]:
            line_id = line["line_id"]
            upstream_node = line["upstream_node"]
            
            prev_node = upstream_node
            for machine in line["machines"]:
                machine_id = machine["machine_id"]
                
                # Add machine node
                nodes.append(NodeSchema(
                    id=machine_id, 
                    type=machine["type"], 
                    name=machine["name"],
                    zone_id=zone_id,
                    line_id=line_id,
                    machine_id=machine_id
                ))
                
                # Connect prev_node -> machine
                edge_id = f"PIPE-{prev_node}-{machine_id}"
                edges.append(EdgeSchema(id=edge_id, source=prev_node, target=machine_id))
                prev_node = machine_id
                
                # Add sensors
                for sensor in machine["sensors"]:
                    sensor_id = sensor["sensor_id"]
                    nodes.append(NodeSchema(
                        id=sensor_id,
                        type="sensor",
                        name=sensor_id,
                        zone_id=zone_id,
                        line_id=line_id,
                        machine_id=machine_id
                    ))
                    # Sensors are treated as inline for this simulation logic
                    edge_id = f"PIPE-{prev_node}-{sensor_id}"
                    edges.append(EdgeSchema(id=edge_id, source=prev_node, target=sensor_id))
                    prev_node = sensor_id
                    
    return TopologySchema(nodes=nodes, edges=edges)

class NetworkGraph:
    def __init__(self, base_dir: str):
        self.topology = load_topology(base_dir)
        self.G = nx.DiGraph()
        self._build_graph()
        
    def _build_graph(self):
        for n in self.topology.nodes:
            self.G.add_node(n.id, **n.dict())
        for e in self.topology.edges:
            self.G.add_edge(e.source, e.target, id=e.id)
            
    def get_downstream_nodes(self, node_id: str) -> list:
        if node_id not in self.G:
            return []
        return list(nx.descendants(self.G, node_id))
        
    def get_upstream_nodes(self, node_id: str) -> list:
        if node_id not in self.G:
            return []
        return list(nx.ancestors(self.G, node_id))
        
    def get_sensor_node(self, sensor_id: str):
        return self.G.nodes.get(sensor_id)
