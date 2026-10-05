import httpx
import base64
import json

def test():
    # Construct test JWT token
    payload_data = {"sub": "dev-user-1", "actor_type": "USER", "role": "waiter"}
    b64 = base64.urlsafe_b64encode(json.dumps(payload_data).encode()).decode().rstrip("=")
    token = f"eyJhbGciOiJIUzI1NiJ9.{b64}.signature"

    headers = {"Authorization": f"Bearer {token}"}
    body = {
        "session_id": "test-live-session-1",
        "message": "Hello Jarvis, what items are available on our menu today?",
        "agent_id": "waiter_ai_v1"
    }

    print("Sending chat request to AI service on http://127.0.0.1:8000/ai/chat...")
    try:
        resp = httpx.post("http://127.0.0.1:8000/ai/chat", json=body, headers=headers, timeout=25.0)
        print(f"Status Code: {resp.status_code}")
        data = resp.json()
        print("\n--- AI Agent Response ---")
        if "reply" in data:
            print(data["reply"])
        else:
            print(data)
        print("--------------------------\n")
    except Exception as e:
        print(f"Error connecting to AI service: {e}")

if __name__ == "__main__":
    test()
