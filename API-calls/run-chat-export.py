import requests
import os
import json

with open("../config.json") as config_file:
    config = json.load(config_file)

API_TOKEN = config.get("api-key", "")

BASE_URL = config.get("api-base-url", "http://localhost:3001/api")
EXPORT_CHAT_URL=f"{BASE_URL}/v1/system/export-chats"
HEADERS = {'Authorization': f'Bearer {API_TOKEN}'}

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

def export_chat(slug, api_base_url="http://localhost:3001/api", api_key="36JCJHM-SCVMZZP-HKG7GQQ-SZWVMPR", api_session_id=None, limit=100, order_by="asc"):

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


if __name__ == "__main__":

    #See the avaibale workspaces
    workspaces = list_workspaces()
    slugs = [workspace["slug"] for workspace in workspaces]
    # print(slugs)

    #Just take the first chat
    chats = {}
    chats[slugs[1]]= export_chat(slugs[1])

    for text in chats[slugs[1]]["history"]:
        print(text)

    

    

    
