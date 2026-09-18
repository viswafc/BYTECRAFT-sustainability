import requests
import sys

def run_health_check():
    try:
        response = requests.get("http://localhost:8000/api/system/status")
        if response.status_code == 200:
            data = response.json()
            print("System Health Report")
            print("====================")
            for k, v in data.items():
                print(f"{k}: {v}")
        else:
            print(f"Backend returned status {response.status_code}")
    except Exception as e:
        print(f"Failed to connect to backend: {e}")
        
if __name__ == "__main__":
    run_health_check()
