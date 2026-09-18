from pydantic import BaseModel
from typing import List, Optional, Dict

class NodeSchema(BaseModel):
    id: str
    type: str # tank, pump, valve, sensor
    name: str
    zone_id: Optional[str] = None
    line_id: Optional[str] = None
    machine_id: Optional[str] = None

class EdgeSchema(BaseModel):
    id: str
    source: str
    target: str

class TopologySchema(BaseModel):
    nodes: List[NodeSchema]
    edges: List[EdgeSchema]
