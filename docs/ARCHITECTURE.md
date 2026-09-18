# AquaRisk AI Architecture

## Overview
AquaRisk AI is an industrial water-risk intelligence platform. This architecture establishes the foundation for industrial telemetry processing, baseline detection, real-time prediction, and digital twin simulation.

## System Components

### 1. Frontend Layer
- **Stack**: React, Vite, TypeScript, TailwindCSS
- **State Management**: Zustand
- **Role**: Provides the Command Center, Live Sensors view, and future intelligence modules.
- **Integration**: Communicates strictly through REST API and WebSockets using a centralized API Client.

### 2. API Layer
- **Stack**: FastAPI (Python)
- **Role**: Validates incoming data using Pydantic, routes requests to Service layer, and manages WebSocket connections for real-time telemetry.

### 3. Service Layer (Business Logic)
- **Role**: Abstract core logic away from API endpoints. Includes ML prediction abstraction (`PredictionService`) and future synthetic simulators.

### 4. Data Access Layer
- **Stack**: SQLAlchemy ORM
- **Role**: Manages all database connections and migrations for PostgreSQL (or SQLite locally).

### 5. ML Pipeline
- **Stack**: Scikit-Learn
- **Role**: Manages data preprocessing, model registry, inference, and telemetry transformations.

## Real-time Infrastructure
- **WebSocket (`/api/ws/system`)**: Provides heartbeat and status updates.
- **WebSocket (`/api/ws/sensors`)**: Will provide continuous live telemetry stream in future phases.
