import requests
import os
##### TO DO ##############
API_TOKEN = "36JCJHM-SCVMZZP-HKG7GQQ-SZWVMPR"

BASE_URL = 'http://localhost:3001/api'
HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}


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

def upload_file(file_path):
    if not os.path.isfile(file_path):
        print(f"The path '{file_path}' is not a valid file.")
        return

    upload_url = f"{BASE_URL}/v1/document/upload"
    file_name = os.path.basename(file_path)

    with open(file_path, 'rb') as file_data:
        files = {'file': (file_name, file_data)}
        response = requests.post(upload_url, headers=HEADERS, files=files)

        if response.status_code == 200:
            print(f"Successfully uploaded file: {file_name}")
        else:
            print(f"Failed to upload file: {file_name}, Status: {response.status_code}")
            print(f"Response Content: {response.text}")

def get_slug(workspace_response, workspace_name):
    for workspace in workspace_response:
        if(workspace["name"]==workspace_name):
            return workspace["slug"]
    return None

def get_local_documents():
    url = f"{BASE_URL}/v1/documents"
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Accept": "application/json"
    }

    response = requests.get(url, headers=headers)
    resp_data = response.json()
    print((resp_data))
    # if response.status_code == 200:
    #     data = response.json()
    #     documents = data.get("localFiles", {}).get("items", [])
    #     print(f"Found {len(documents)} document(s):")
    #     for doc in documents:
    #         print(f"- {doc['name']} (ID: {doc['id']})")
    #     return documents

    # elif response.status_code == 403:
    #     print("Error: Invalid API Key or no access.")
    # elif response.status_code == 500:
    #     print("Error: Internal Server Error.")
    # else:
    #     print(f"Unexpected error: {response.status_code}")
    #     print(response.text)

    return None

def delete_custom_documents_folder():
    """
    Deletes the 'custom-documents' folder and all its contents from document storage.
    """
    url = f"{BASE_URL}/v1/document/remove-folder"
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    payload = {
        "name": "custom-documents"
    }

    response = requests.delete(url, headers=headers, json=payload)

    if response.status_code == 200:
        print("Folder deleted:", response.json().get("message"))
    elif response.status_code == 403:
        print("Forbidden: Invalid API key or access denied.")
    elif response.status_code == 500:
        print("Internal Server Error: Could not delete the folder.")
    else:
        print(f"Unexpected error: {response.status_code}")
        print(response.text)

    return response.json()

def get_matched_files():

    documents_url = f"{BASE_URL}/v1/documents"
    print("Requesting list of all stored documents from AnythingLLM API...")
    documents_resp = requests.get(documents_url, headers=HEADERS)
    all_documents = documents_resp.json().get('localFiles', {}).get('items', [])

    print(all_documents)

    return all_documents

def create_embed(workspace_slug,
                 chat_mode="chat",
                 allowlist_domains=None,
                 allow_model_override=False,
                 allow_temperature_override=False,
                 allow_prompt_override=False,
                 max_chats_per_day=100,
                 max_chats_per_session=10):
    
    if allowlist_domains is None:
        allowlist_domains = []

    url = f"{BASE_URL}/v1/embed/new"
    payload = {
        "workspace_slug": workspace_slug,
        "chat_mode": chat_mode,
        "allowlist_domains": allowlist_domains,
        "allow_model_override": allow_model_override,
        "allow_temperature_override": allow_temperature_override,
        "allow_prompt_override": allow_prompt_override,
        "max_chats_per_day": max_chats_per_day,
        "max_chats_per_session": max_chats_per_session
    }

    response = requests.post(url, headers=HEADERS, json=payload)

    if response.status_code == 200:
        embed_info = response.json().get("embed", {})
        print(f"Embed created successfully with ID: {embed_info.get('id')} and UUID: {embed_info.get('uuid')}")
        return embed_info
    else:
        print(f"Failed to create embed: {response.status_code} {response.text}")
        return None

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

if __name__ == "__main__":
    list_workspaces()
    # upload_file("C:/Haqathon/bank.json")
    get_local_documents()
    print("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
    create_embed("haq")
    print("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")

    slug="haqathon"
    chat_url=f"{BASE_URL}/v1/workspace/{slug}/chat"
        # Send prompt
    prompt = "Can you summarise the bank statement for me?"
    print("\nSending Prompt:")
    response = send_chat_request(chat_url, prompt, "query")




