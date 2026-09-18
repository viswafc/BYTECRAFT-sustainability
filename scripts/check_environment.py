import sys
import os

def check_env():
    try:
        from backend.app.config import settings
        from sqlalchemy import create_engine
        from sqlalchemy.exc import OperationalError
        
        engine = create_engine(settings.DATABASE_URL)
        connection = engine.connect()
        connection.close()
        print("ONLINE")
    except Exception as e:
        print("OFFLINE")
        sys.exit(1)

if __name__ == "__main__":
    # Must be run from the root directory so backend.app is resolvable
    sys.path.append(os.getcwd())
    check_env()
