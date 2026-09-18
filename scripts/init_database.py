import sys
import os

def init_db():
    sys.path.append(os.getcwd())
    
    try:
        from backend.app.config import settings
        from backend.app.core.database import engine
        from backend.app.models.domain import Base
        
        print(f"Connecting to database at {settings.DATABASE_URL}...")
        
        # Create all tables natively
        Base.metadata.create_all(bind=engine)
        print("Database schemas initialized successfully!")
        
    except Exception as e:
        print(f"Failed to initialize database: {e}")
        print("Please ensure XAMPP MySQL is running and the 'aurarisk_ai' database has been created via phpMyAdmin.")
        sys.exit(1)

if __name__ == "__main__":
    init_db()
