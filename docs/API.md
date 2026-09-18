# API Reference (Phase 2)

Base URL: `http://localhost:8000` (or same-origin via the frontend proxy). Interactive docs: `/docs`.

## Response envelope

```json
{ "data": { ... } | [ ... ], "meta": { "timestamp": "ISO-8601", "version": "0.1.0", "count": 20, "limit": 100, "offset": 0, "source": "database" } }
```
`count/limit/offset` appear on list endpoints; `source` names the telemetry provider.

## Error envelope

```json
{ "error": { "code": "SENSOR_NOT_FOUND", "message": "Sensor S06 was not found.", "details": [ ... optional ... ] } }
```

## Endpoints

| Method | Path | Response `data` | Notes |
|---|---|---|---|
| GET | `/health`, `/api/health` | `{status:"healthy", version}` | plain (no envelope) for probes |
| GET | `/api/version` | `VersionResponse` | name, version, api_version, environment, phase |
| GET | `/api/system/status` | `SystemStatusResponse` | `state` + components[backend, database, ml, websocket, telemetry, dataset] |
| GET | `/api/data/health` | `DataHealthResponse` | baseline CSV integrity |
| GET | `/api/plants` `?status&limit&offset` | `PlantResponse[]` | |
| GET | `/api/plants/{id}` | `PlantResponse` | 404 `PLANT_NOT_FOUND` |
| GET | `/api/plants/{id}/summary` | `PlantSummary` | counts of zones/lines/machines/sensors, sensors_by_status, active_incidents |
| GET | `/api/zones` `?plant_id` · `/api/zones/{id}` | `ZoneResponse` | |
| GET | `/api/lines` `?zone_id|plant_id` · `/api/lines/{id}` | `LineResponse` | |
| GET | `/api/machines` `?line_id|plant_id` · `/api/machines/{id}` | `MachineResponse` | |
| GET | `/api/sensors` `?plant_id&machine_id&sensor_type&status` | `SensorResponse[]` | |
| GET | `/api/sensors/{id}` · `/api/sensors/by-code/{code}` | `SensorResponse` | 404 `SENSOR_NOT_FOUND` |
| GET | `/api/telemetry/summary` `?plant_id` | `TelemetrySummary` | sensors_total/online/warning, readings_today, last_reading_at, note |
| GET | `/api/telemetry/sensors/{id}/latest` | `SensorReadingResponse \| null` | null until telemetry exists |
| GET | `/api/telemetry/sensors/{id}/history` `?since&until&limit` | `SensorReadingResponse[]` | |
| GET | `/api/incidents` `?plant_id&status&severity&active_only` · `/api/incidents/{id}` | `IncidentResponse` | read-only in Phase 2 |
| GET | `/api/ml/models` | `ModelResponse[]` | from `ml/artifacts` metadata |
| GET | `/api/ml/health` | `ModelHealth` | `MODEL_NOT_READY` detail when no default model |
| POST | `/api/ml/predict` | `PredictResponse` | body `{readings:[SensorReadingInput], model_name?: "<config>/<model>"}`; response includes a `disclaimer` |
| WS | `/api/ws/system` | frames | `connected` → `system_heartbeat` every N s; send `"ping"` → `pong` |
| WS | `/api/ws/sensors` | frames | reserved for telemetry frames (Phase 3); `connected` + ping/pong only |

### Heartbeat frame
```json
{ "type": "system_heartbeat", "timestamp": "...", "status": "online", "components": { "backend": "ONLINE", "database": "ONLINE", "ml": "ONLINE", "websocket": "ONLINE", "telemetry": "ONLINE", "dataset": "ONLINE" } }
```

### Health states
`ONLINE | DEGRADED | OFFLINE | UNKNOWN` — for every component and for the aggregate.

## Headers
- `x-request-id` is echoed (or generated) on every response and included in the JSON request log.
- CORS: only `CORS_ORIGINS`; methods `GET, POST, OPTIONS`.
