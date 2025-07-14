import requests
import os
import pyttsx3
import json

with open("../config.json") as config_file:
    config = json.load(config_file)

API_TOKEN = config.get("api-key", "SAC2CQC-D9R47H7-HN0FKJV-WMXSTMG")

# API Endpoints
upload_url = config.get("api-base-url", "http://localhost:3001/api") + "/v1/document/upload"
chat_url = config.get("api-base-url", "http://localhost:3001/api") + "/v1/workspace/haqathon/chat"

file_path = os.path.join(os.path.dirname(__file__), "everything.wav")

def speak(text):
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    engine.setProperty('voice', voices[1].id)
    engine.say(text)
    engine.runAndWait()

# Upload audio file
def upload_audio_file(file_path, url):
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "accept": "application/json",
    }

    files = {
        "file": ("everything.wav", open(file_path, "rb"), "audio/wav")
    }

    try:
        response = requests.post(url, headers=headers, files=files)
        response.raise_for_status()
        print("Upload successful")
        return response.json()
    except requests.exceptions.RequestException as e:
        print("Upload failed:", e)
        if e.response is not None:
            print(e.response.text)
        return None


# Send transcription to AnythingLLM chat
def send_to_llm_chat(prompt):
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    data = {
        "message": prompt,
        "mode": "chat"
    }

    try:
        response = requests.post(chat_url, headers=headers, json=data)
        response.raise_for_status()
        print("LLM Response:")
        print(response.json())
        speak(response.json().get("textResponse", "No response text found."))
    except requests.exceptions.RequestException as e:
        print("Chat request failed:", e)
        if e.response is not None:
            print(e.response.text)


# Main program
if __name__ == "__main__":
    print(f"🔄 Uploading audio file: {file_path}")
    upload_data = upload_audio_file(file_path, upload_url)

    if upload_data and upload_data.get("documents"):
        page_content = upload_data["documents"][0].get("pageContent")
        if page_content:
            print("\n📄 Transcription extracted from document:")
            print(page_content)

            print("\n💬 Sending transcription to AnythingLLM chat...")
            send_to_llm_chat(page_content)
        else:
            print(" No transcription found in pageContent.")
    else:
        print(" Upload response missing document data.")
