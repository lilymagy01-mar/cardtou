import requests
import json

url = "http://localhost:3000/api/ai/message"
payload = {
    "occasion": "wedding",
    "relationship": "friend",
    "senderName": "Agent",
    "recipientName": "User",
    "tone": "warm"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
