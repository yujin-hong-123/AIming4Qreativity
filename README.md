# Gran-Bot: AI Assistant for the Elderly

## 🧠 Overview
**Gran-Bot** is a privacy-first, voice-enabled AI assistant designed to empower elderly individuals—especially those with cognitive decline or limited tech literacy—by offering intuitive, secure, and empathetic digital support.


## 📌 Motivation
Elderly users often face challenges with:
- Navigating complex digital interfaces
- Remembering tasks or important information
- Maintaining independence while staying safe

**Gran-Bot** addresses these issues with a **fully local AI assistant**, ensuring **data privacy** and **user dignity**.


## 🎯 Key Features
- **Conversational Voice Interface**: Natural, hands-free interaction using Whisper + LLM.
- **Smart Summaries for Caregivers**: Privacy-conscious logs to keep loved ones informed.
- **Contextual Document Retrieval**: Secure access to personal documents via RAG.
- **Real-Time Scam Detection**: Alerts users to suspicious messages or calls.
- **Empathetic Engagement**: Personalized, emotionally intelligent conversations.


## 🛠️ Technology Stack
- **Whisper**: Converts speech to text for voice-based interaction.
- **AnythingLLM**: Local LLM instance for private, intelligent responses.
- **RAG (Retrieval-Augmented Generation)**: Context-aware document lookup.

All components run **entirely offline**, ensuring **no cloud dependency** and **maximum privacy**.

### Implementation
This app was built for the Snapdragon X Elite but designed to be platform agnostic. Performance may vary on other hardware.

***Hardware***
- Machine: Dell Latitude 7455
- Chip: Snapdragon X Elite
- OS: Windows 11
- Memory: 32 GB

***Software***
- Python Version: 3.12.6
- npm package manager
- AnythingLLM LLM Provider: AnythingLLM NPU (For older version, this may show Qualcomm QNN)
- AnythingLLM Chat Model: Llama 3.1 8B Chat 8K

## Setup
1. Install and setup [AnythingLLM](https://anythingllm.com/).
    1. Choose AnythingLLM NPU when prompted to choose an LLM provider to target the NPU
    2. Choose a model of your choice when prompted. This sample uses Llama 3.1 8B Chat with 8K context
2. Create a workspace by clicking "+ New Workspace". Note down the workspace name (name it 'haqathon').
    1. Navigate to the chat settings for the workspace and copy in the contents of system_prompt.txt into the prompt section.
    2. Upload the files in documents folder to the workspace. 
3. Generate an API key
    1. Click the settings button on the bottom of the left panel
    2. Open the "Tools" dropdown
    3. Click "Developer API"
    4. Click "Generate New API Key"
4. Open a PowerShell instance and clone the repo
    ```
    git clone https://github.com/yujin-hong-123/AIming4Qreativity.git
    ```
5. Create and activate your virtual environment with reqs
    ```
    # 1. navigate to the cloned directory
    cd AIming4Qreativity

    # 2. create the python virtual environment (optional)
    python -m venv llm-venv

    # 3. activate the virtual environment (optional)
    ./llm-venv/Scripts/Activate.ps1     # windows
    source \llm-venv\bin\activate       # mac/linux

    # 4. install the requirements
    pip install -r requirements.txt
    ```
6. Edit the `config.json` file with the following variables
    ```
    api_key: "your-key-here"
    model_server_base_url: "http://localhost:3001/api/"
    chat-slug: "your-slug-here"
    ```
7. Test the model server auth to verify the API key
    ```
    python API-calls/run-auth.py
    ```
8. Install npm dependencies
    ```
    cd frontend
    npm install
    ```

### Usage
This application was built using flask-react and nodeJS. You will need two terminals running the frontend and the backend. If you created a python environment in the earlier step, you will need to activate it first.
```
# terminal 1 (backend)
cd backend
python app.py

# terminal 2 (frontend)
cd frontend
npm start
```
The summarization of chat needs to be run as a separate script. This is to prevent crashes due to limits on the anythingLLM
```
cd API-calls
python ./run-export-chat-summary.py
```

A window should pop up with the frontend and you should be able to use it.

## Troubleshooting
***General crashes***<br>
Restart anythingLLM on your machine and clearing all chats works in most cases. This is because of resource constraints on the machine and the app itself. You need to keep AnythingLLM, backend and frontend all open. If a chat is successful, you will be able to see the transcription recorded in the anythingLLM chat window for the asssociated slug. PLease clear the workspace uploaded files from time to time since multiple conversations may clog up the pipeline overtime.

***Glitchy chat window***<br>
The application was designed to function as a completely end-to-end voice activated chat. To enable this, the chat mode starts listening immediately and waits for a pause (complete silence) for about 2 seconds. If successful, you will see a recording.wav downloaded. Only after this may you hit send. The backend takes time because of system resource limitations. You may use a smaller model but we haven't tested this out.

***AnythingLLM NPU Runtime Missing***<br>
On a Snapdragon X Elite machine, AnythingLLM NPU should be the default LLM Provider. If you do not see it as an option in the dropdown, you downloaded the AMD64 version of AnythingLLM. Delete the app and install the ARM64 version instead.

***Model Not Downloaded***<br>
Sometimes the selected model fails to download, causing an error in the generation. To resolve, check the model in Settings -> AI Providers -> LLM in AnythingLLM. You should see "uninstall" on the model card if it is installed correctly. If you see "model requires download," choose another model, click save, switch back, then save. You should see the model download in the upper right corner of the AnythingLLM window.
