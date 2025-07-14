import requests
import json

with open("../config.json") as config_file:
    config = json.load(config_file)

API_TOKEN = config.get("api-key", "36JCJHM-SCVMZZP-HKG7GQQ-SZWVMPR")
auth_url = config.get("api-base-url", "http://localhost:3001/api") + "/v1/auth"

def auth(url):
    
    headers = {
        "Authorization": f"Bearer {API_TOKEN}"
    }

    response = requests.get(url, headers=headers)
    return response

def print_resp(response):
    
    if response.ok:
        data = response.json()  # Converts JSON response to Python dict/list
        print(data)
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":

    response = auth(auth_url)
    print_resp(response)


