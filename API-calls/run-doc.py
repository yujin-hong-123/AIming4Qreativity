import requests
import os

API_TOKEN = "36JCJHM-SCVMZZP-HKG7GQQ-SZWVMPR"

BASE_URL = 'http://localhost:3001/api'
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

def upload_directory(directory_path):
    if not os.path.isdir(directory_path):
        print(f"The path '{directory_path}' is not a valid directory.")
        return

    upload_url = f"{BASE_URL}/v1/document/upload"
    success_count = 0
    total_files = 0

    for root, _, files in os.walk(directory_path):
        for file_name in files:
            file_path = os.path.join(root, file_name)
            total_files += 1

            with open(file_path, 'rb') as file_data:
                files = {'file': (file_name, file_data)}
                response = requests.post(upload_url, headers=HEADERS, files=files)

                if response.status_code == 200:
                    print(f"Uploaded file: {file_name}")
                    success_count += 1
                else:
                    print(f"Failed to upload file: {file_name}, Status: {response.status_code}")
                    print(f"Response Content: {response.text}")

    print(f"Successfully uploaded {success_count}/{total_files} files from directory '{directory_path}'.")

def get_slug(workspace_response, workspace_name):
    for workspace in workspace_response:
        if(workspace["name"]==workspace_name):
            return workspace["slug"]
    return None

def get_matched_files():

    documents_url = f"{BASE_URL}/v1/documents"
    print("Requesting list of all stored documents from AnythingLLM API...")
    documents_resp = requests.get(documents_url, headers=HEADERS)
    all_documents = documents_resp.json().get('localFiles', {}).get('items', [])

    print(all_documents)

    return all_documents

if __name__ == "__main__":
    list_workspaces()
    upload_directory(r"../../bank.json")


