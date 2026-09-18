# Docker Migration Audit

## Overview
This document records the results of the Docker and PostgreSQL dependency audit for AquaRisk AI.

## Docker Files Found
- No `Dockerfile` found.
- No `docker-compose.yml` found.
*(Note: These files were either never committed or have already been removed. Regardless, there are no structural Docker runtime files present in the repository.)*

## Docker References Found
1. `README.md`: Mentions setting up the repository via Docker Compose.
2. `docs/PHASE_STATUS.md`: Mentions "Docker: OK" and "Docker and Docker Compose configured."
3. `docs/DEVELOPMENT.md`: Mentions Docker Environment and `docker compose up --build`.
4. `docs/BASELINE_AUDIT.md`: Mentions containerizing with Docker and Docker Compose.

## PostgreSQL References Found
1. `README.md`: Mentions PostgreSQL as the database.
2. `docs/PHASE_STATUS.md`: Mentions PostgreSQL schemas and connections.
3. `docs/PHASE_3_STATUS.md`: Mentions PostgreSQL ingestion.
4. `docs/DEVELOPMENT.md`: Mentions running the full stack with PostgreSQL.
5. `docs/DATABASE.md`: Identifies PostgreSQL as the primary database.
6. `docs/ARCHITECTURE.md`: Manages connections for PostgreSQL.
7. `backend/app/config.py`: Default `DATABASE_URL` uses PostgreSQL format.
8. `backend/app/main.py`: Hardcoded logic checking if database is "postgres".
9. `backend/app/api/baseline.py`: Contains a comment referencing Postgres `DISTINCT ON`.
10. `database/schemas.sql`: Dedicated to PostgreSQL schemas.

## Action Plan
- Remove all mentions of Docker from documentation.
- Replace PostgreSQL configurations with `mysql+pymysql` for XAMPP MySQL/MariaDB.
- Write new setup scripts for Native Windows + XAMPP.
- Install `pymysql`.
