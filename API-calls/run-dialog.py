import requests
import json

with open("../config.json") as config_file:
    config = json.load(config_file)

API_TOKEN = config.get("api-key", "")

# API Endpoints
# base_url = "http://localhost:3001/api"
base_url = config.get("api-base-url", "http://localhost:3001/api")
auth_url = f"{base_url}/v1/auth"
chat_url = f"{base_url}/v1/workspace/haq/chat"


# Function to check auth
def auth(url):
    headers = {
        "Authorization": f"Bearer {API_TOKEN}"
    }

    response = requests.get(url, headers=headers)
    return response

# Function to send chat or query
def send_chat_request(url, prompt, mode):
    if mode not in ["query", "chat"]:
        raise ValueError("mode must be either 'query' or 'chat'")

    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    data = {
        "message": prompt,
        "mode": mode
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as e:
        print("Request failed:", e)
        return None

# Print formatted response
def print_resp(response):
    if response is None:
        print("No response received.")
        return

    if response.ok:
        data = response.json()
        print("Response:")
        print(data)
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

# Main program
if __name__ == "__main__":
    # Test auth
    response = auth(auth_url)
    print("Auth Check:")
    print_resp(response)

    # Send prompt
    prompt = "What is the best cookie in the world?"
    print("\nSending Prompt:")
    response = send_chat_request(chat_url, prompt, "chat")
    print_resp(response)
