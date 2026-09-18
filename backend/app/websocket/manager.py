"""Channel-based WebSocket connection manager + heartbeat broadcaster.

Channels: "system" (heartbeat/status) and "sensors" (reserved for telemetry frames in Phase 3+).
Phase 2 only broadcasts heartbeats; no telemetry is fabricated.
"""
from __future__ import annotations

import asyncio
import json
import logging
from collections import defaultdict
from datetime import datetime, timezone

from fastapi import WebSocket

log = logging.getLogger("aquarisk.ws")


class ConnectionManager:
    def __init__(self) -> None:
        self._channels: dict[str, set[WebSocket]] = defaultdict(set)
        self._task: asyncio.Task | None = None
        self.running = False
        self._lock = asyncio.Lock()

    # ---- connections
    async def connect(self, channel: str, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self._channels[channel].add(ws)
        log.info("ws connect", extra={"path": f"/api/ws/{channel}"})

    async def disconnect(self, channel: str, ws: WebSocket) -> None:
        async with self._lock:
            self._channels[channel].discard(ws)

    @property
    def connection_count(self) -> int:
        return sum(len(s) for s in self._channels.values())

    def channel_counts(self) -> dict[str, int]:
        return {k: len(v) for k, v in self._channels.items()}

    # ---- broadcast
    async def broadcast(self, channel: str, message: dict) -> None:
        payload = json.dumps(message)
        dead: list[WebSocket] = []
        for ws in list(self._channels.get(channel, ())):
            try:
                await ws.send_text(payload)
            except Exception:  # noqa: BLE001 - client went away
                dead.append(ws)
        for ws in dead:
            await self.disconnect(channel, ws)

    # ---- heartbeat loop
    async def _heartbeat_loop(self, interval: float) -> None:
        from ..services.system_service import system_status  # lazy: avoids import cycle

        while True:
            try:
                status = await asyncio.to_thread(system_status)
                await self.broadcast("system", {
                    "type": "system_heartbeat",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "status": status.state.lower(),
                    "components": {c.name: c.state for c in status.components},
                })
            except Exception:  # noqa: BLE001
                log.exception("heartbeat failed")
            await asyncio.sleep(interval)

    def start(self, interval: float) -> None:
        if self._task is None:
            self._task = asyncio.create_task(self._heartbeat_loop(interval))
            self.running = True

    async def stop(self) -> None:
        self.running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None


ws_manager = ConnectionManager()
