# config/

Non-secret, environment-independent configuration. Secrets and environment-specific
values live in `.env` (see `.env.example` at the repo root) and are read by
`backend/app/config.py` via pydantic-settings.
