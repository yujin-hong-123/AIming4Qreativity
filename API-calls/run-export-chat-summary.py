import requests
import os
import json
import sqlite3
from datetime import datetime

API_TOKEN = "SAC2CQC-D9R47H7-HN0FKJV-WMXSTMG"

BASE_URL = 'http://localhost:3001/api'
EXPORT_CHAT_URL=f"{BASE_URL}/v1/system/export-chats"
chat_url = f"{BASE_URL}/v1/workspace/haqathon/chat"
HEADERS = {'Authorization': f'Bearer {API_TOKEN}'}

CL = 1024

def list_workspaces():

    url = f"{BASE_URL}/workspaces"
    headers = {
        f"Authorization": "Bearer {API_TOKEN}"
    }

    workspaces_resp = requests.get(url, headers=headers)

    # Print status and content for debugging
    # print("Status Code:", workspaces_resp.status_code)
    # print("Response Text:", workspaces_resp.text)

    # Check status and content before parsing
    if workspaces_resp.status_code == 200 and workspaces_resp.text.strip():
        try:
            workspaces = workspaces_resp.json().get('workspaces', [])
        except ValueError as e:
            print("Failed to parse JSON:", e)
            workspaces = []
    else:
        print("Empty or invalid response from server.")
        workspaces = []

    # print("Workspaces:", workspaces)
    num_workspaces = len(workspaces)
    print(f"There are {num_workspaces} workspaces available.")
    for workspace in workspaces:
        print(f"ID:{workspace["id"]}\t\tname:{workspace["name"]}\t\tslug:{workspace["slug"]}")
    # workspace_array = workspaces["workspaces"]
    # print(workspace_array)
    return workspaces

def get_slug(workspace_response, workspace_name):
    for workspace in workspace_response:
        if(workspace["name"]==workspace_name):
            return workspace["slug"]
    return None

def export_chat(slug, api_base_url="http://localhost:3001/api", api_key=API_TOKEN, api_session_id=None, limit=100, order_by="asc"):

    url = f"{api_base_url}/v1/workspace/{slug}/chats"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json"
    }

    params = {
        "limit": limit,
        "orderBy": order_by
    }

    if api_session_id:
        params["apiSessionId"] = api_session_id

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        return response.json()
    elif response.status_code == 403:
        return {"error": "Forbidden: Invalid API key or no access to workspace."}
    elif response.status_code == 400:
        return {"error": "Bad Request: Check query parameters."}
    elif response.status_code == 500:
        return {"error": "Server Error"}
    else:
        return {
            "error": f"Unexpected status code: {response.status_code}",
            "details": response.text
        }
    
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

def format_json(response):

    def insert_log(json_data):
        # Construct path relative to the current script's location
        db_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'app.db')
        connection = sqlite3.connect(db_path)
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO logs (date, description) VALUES (?, ?)
        """, (json_data["date"], json_data["description"]))

        connection.commit()
        connection.close()

    summary_dict = {
        "date" : datetime.now().strftime('%Y:%m:%d'),
        "description" : response.json().get("textResponse", "No response text found.")
    }

    insert_log(json_data=summary_dict)

if __name__ == "__main__":

    #See the avaibale workspaces
    workspaces = list_workspaces()
    slugs = [workspace["slug"] for workspace in workspaces]
    print(slugs)

    #Just take the first chat
    chats = {}
    chats[slugs[-1]]= export_chat(slugs[-1])
    chat_responses=chats[slugs[-1]]["history"]

    for text in chats[slugs[-1]]["history"]:
        print(text)
    
    print("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")

    s = json.dumps(chat_responses, indent=2)
    print(s)

    s = "Can you Summarise this for me? : \n" + s

    print("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")

    response = send_chat_request(chat_url, s[:CL], "chat")
    print_resp(response)
    # test_json = {'id': 'a362bbac-e428-4dc1-b95e-02caa8a45457', 'type': 'textResponse', 'close': True, 'error': None, 'chatId': 39, 'textResponse': "This conversation revolves around the user's interest in accessing an API through a web server. The AI has explained that it cannot launch a web server or provide direct access to APIs and provided information on how to set up and access APIs from their own system. The user is seeking assistance with this process, possibly due to confusion or lack of knowledge about the topic.", 'sources': [], 'metrics': {'prompt_tokens': 2799, 'completion_tokens': 73, 'total_tokens': 2872, 'outputTps': 1.1391476678682335, 'duration': 64.083}}
    format_json(response)


    

    

    

    
