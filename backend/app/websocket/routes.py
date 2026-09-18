from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from .manager import ws_manager

router = APIRouter(prefix="/api/ws", tags=["websocket"])

CHANNELS = {"system", "sensors"}


async def _serve(channel: str, ws: WebSocket) -> None:
    await ws_manager.connect(channel, ws)
    await ws.send_json({"type": "connected", "channel": channel,
                        "timestamp": datetime.now(timezone.utc).isoformat()})
    try:
        while True:
            msg = await ws.receive_text()  # clients may send "ping"
            if msg == "ping":
                await ws.send_json({"type": "pong", "timestamp": datetime.now(timezone.utc).isoformat()})
    except WebSocketDisconnect:
        pass
    finally:
        await ws_manager.disconnect(channel, ws)


@router.websocket("/system")
async def ws_system(ws: WebSocket):
    """System heartbeat: {"type":"system_heartbeat","timestamp":...,"status":"online"} every N seconds."""
    await _serve("system", ws)


@router.websocket("/sensors")
async def ws_sensors(ws: WebSocket):
    """Reserved for telemetry frames (Phase 3). Currently only acknowledges connection and pings."""
    await _serve("sensors", ws)
