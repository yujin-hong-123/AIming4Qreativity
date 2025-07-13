import requests

API_TOKEN="36JCJHM-SCVMZZP-HKG7GQQ-SZWVMPR"
url = "http://localhost:3001/api/v1/workspace/haqathon/chats"
auth_url = "http://localhost:3001/api/v1/auth"
chat_url="http://localhost:3001/api/v1/workspace/haqathon/chat"

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

    prompt = "What is the best cookie in the world?"

    response = send_chat_request(chat_url, prompt, "chat")
    print_resp(response)


