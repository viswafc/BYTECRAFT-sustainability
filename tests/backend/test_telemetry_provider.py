"""The provider abstraction must be swappable without touching routes."""
from backend.app.schemas.telemetry import TelemetrySummary
from backend.app.services.telemetry.base import TelemetryProvider
from backend.app.services.telemetry.null_provider import NullTelemetryProvider


class FakeProvider(TelemetryProvider):
    name = "fake"
    def latest(self, sensor_id): return None
    def history(self, sensor_id, *, since=None, until=None, limit=500): return []
    def summary(self, plant_id=None):
        return TelemetrySummary(provider=self.name, sensors_total=1, sensors_online=1, sensors_warning=0,
                                readings_today=0, last_reading_at=None)


def test_provider_override_via_dependency(client_nodb):
    from backend.app.main import app
    from backend.app.services.telemetry import get_telemetry_provider
    app.dependency_overrides[get_telemetry_provider] = lambda: FakeProvider()
    try:
        b = client_nodb.get("/api/telemetry/summary").json()
        assert b["data"]["provider"] == "fake" and b["meta"]["source"] == "fake"
    finally:
        app.dependency_overrides.clear()


def test_null_provider_is_honest():
    p = NullTelemetryProvider()
    assert p.summary().sensors_total == 0 and p.health()[0] == "OFFLINE"
