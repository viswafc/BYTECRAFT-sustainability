from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from datetime import datetime
import json

ws_router = APIRouter()

@ws_router.websocket("/ws/system")
async def websocket_system_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # For Phase 2, we just send a heartbeat
            payload = {
                "type": "system_heartbeat",
                "timestamp": datetime.utcnow().isoformat(),
                "status": "online"
            }
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        pass

@ws_router.websocket("/ws/sensors")
async def websocket_sensors_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Placeholder for future live telemetry stream
            payload = {
                "type": "sensor_stream_status",
                "message": "Awaiting live intelligence data.",
                "timestamp": datetime.utcnow().isoformat()
            }
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        pass
