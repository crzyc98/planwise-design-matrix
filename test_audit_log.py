import requests
import json

BASE_URL = "http://localhost:8000"

def test_audit_log():
    print("Testing Audit Log Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/audit-log")
        if response.status_code == 200:
            entries = response.json()
            print(f"✅ Success! Retrieved {len(entries)} audit log entries.")
            if entries:
                print("Sample Entry:")
                print(json.dumps(entries[0], indent=2))
        else:
            print(f"❌ Failed. Status Code: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure the backend server is running.")

if __name__ == "__main__":
    test_audit_log()
