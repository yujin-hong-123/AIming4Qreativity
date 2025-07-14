# GranBot chat app

A simple, NPU-accelerated chat app running locally on the [AnythingLLM](https://anythingllm.com/) model server. AnythingLLM's model server provides automatic RAG, long-term memory, and other LLM optimizations with Workspace separation.

To write the code from scratch with me, check out this [build along video](https://www.youtube.com/watch?v=Cb-TvjTV4Eg) on Youtube!

### Table of Contents
[1. Purpose](#purpose)<br>
[2. Implementation](#implementation)<br>
[3. Setup](#setup)<br>
[4. Usage](#usage)<br>
[5. Troubleshooting](#troubleshooting)<br>
[6. Contributing](#contributing)<br>
[7. Code of Conduct](#code-of-conduct)<br>

### Purpose
This is an extensible base app for a custom local language model. [AnythingLLM](https://anythingllm.com/) includes many API endpoints, including Open AI compatibility, that you can use to expand functionality. You can access the Swagger API docs in Settings -> Tools -> Developer API -> Read the API documentation. An empty template for this app is available [here](https://github.com/thatrandomfrenchdude/simple-npu-chatbot-template) on GitHub for use during build-along workshops.

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

### Setup
1. Install and setup [AnythingLLM](https://anythingllm.com/).
    1. Choose AnythingLLM NPU when prompted to choose an LLM provider to target the NPU
    2. Choose a model of your choice when prompted. This sample uses Llama 3.1 8B Chat with 8K context
2. Create a workspace by clicking "+ New Workspace". Note down the workspace name (name it 'haqathon').
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
    python src/run-auth.py
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

A window should pop up with the frontend and you should be able to use it.

### Troubleshooting
*** General crashes ***<br>
Restart anythingLLM on your machine and clearing all chats works in most cases. This is because of resource constraints on the machine and the app itself.

***AnythingLLM NPU Runtime Missing***<br>
On a Snapdragon X Elite machine, AnythingLLM NPU should be the default LLM Provider. If you do not see it as an option in the dropdown, you downloaded the AMD64 version of AnythingLLM. Delete the app and install the ARM64 version instead.

***Model Not Downloaded***<br>
Sometimes the selected model fails to download, causing an error in the generation. To resolve, check the model in Settings -> AI Providers -> LLM in AnythingLLM. You should see "uninstall" on the model card if it is installed correctly. If you see "model requires download," choose another model, click save, switch back, then save. You should see the model download in the upper right corner of the AnythingLLM window.
