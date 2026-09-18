from backend.app.core.database import engine, Base
from backend.app.models.domain import *

print("Creating new tables...")
Base.metadata.create_all(bind=engine)
print("Done.")
