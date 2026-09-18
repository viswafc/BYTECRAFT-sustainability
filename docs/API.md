# API Documentation

## Base URL
`/api`

## Standard Response Format
All REST endpoints adhere to a standardized schema to ensure predictable client consumption:
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-09-18T12:00:00Z",
    "version": "0.1.0"
  }
}
```

## REST Endpoints

### System
- `GET /system/status`: Returns system health, database connection status, and ML model loaded status.
- `GET /health`: Basic ping endpoint.

### Infrastructure (CRUD)
- `GET /plants`: Retrieves all industrial plants.
- `GET /zones`: Retrieves all zones.
- `GET /lines`: Retrieves production lines.
- `GET /machines`: Retrieves all machine assets.
- `GET /sensors`: Retrieves deployed sensors and configurations.

## WebSockets
- `ws://<host>/api/ws/system`: System health stream.
- `ws://<host>/api/ws/sensors`: Live telemetry stream (Currently transmits 'Awaiting data' heartbeat).
