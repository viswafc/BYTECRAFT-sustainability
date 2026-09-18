-- PostgreSQL Schema for AquaRisk AI (Phase 1 Foundation)

CREATE TABLE IF NOT EXISTS plants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    plant_id INT REFERENCES plants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lines (
    id SERIAL PRIMARY KEY,
    zone_id INT REFERENCES zones(id),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS machines (
    id SERIAL PRIMARY KEY,
    line_id INT REFERENCES lines(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensors (
    id SERIAL PRIMARY KEY,
    machine_id INT REFERENCES machines(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- e.g., 'pressure', 'flow', 'vibration'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    sensor_id INT REFERENCES sensors(id),
    value FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    zone_id INT REFERENCES zones(id),
    line_id INT REFERENCES lines(id),
    type VARCHAR(100) NOT NULL, -- e.g., 'leak'
    severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'open',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    path VARCHAR(500) NOT NULL,
    accuracy FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_runs (
    id BIGSERIAL PRIMARY KEY,
    model_id INT REFERENCES models(id),
    prediction_result JSONB NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
