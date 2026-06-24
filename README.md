# Nereid - AI Assistant Chat Interface

## Description

**Nereid** is a modern, full-stack AI chat application that provides an intuitive web-based interface for interacting with an AI assistant. Built with React for the frontend and FastAPI for the backend, Nereid connects to Ollama's local language models to deliver responsive, conversational AI interactions.

The application features a sleek, modern UI with a dark ocean theme using teal/blue gradients, sidebar navigation, and real-time messaging capabilities. Users can have natural conversations with the AI companion through a clean, chat-based interface that resembles premium modern messaging applications.

### Key Components

- **Frontend (React)**: Modern single-page application with component-based architecture
- **Backend (FastAPI)**: RESTful API server that bridges the React frontend with Ollama
- **AI Engine (Ollama)**: Local LLM inference using models like Llama 3.2
- **Real-time Chat**: Instant messaging interface with message history and typing indicators

## Features

- Modern, clean React interface matching the design
- Real-time chat with Nereid AI assistant
- Responsive sidebar navigation
- Beautiful dark ocean theme with teal/blue gradients and glassmorphism elements
- FastAPI backend connecting React to Ollama

## Prerequisites

- Node.js (v16 or higher) and npm
- Python 3.8 or higher
- Ollama installed and running ([Download Ollama](https://ollama.ai/))
- The `llama3.2:latest` model (or any other model you prefer)

## Setup Instructions

### 1. Install Ollama and Download Model

If you haven't already:

```bash
# Install Ollama from https://ollama.ai/
# Then pull the model:
ollama pull llama3.2:latest
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3. Install React Dependencies

```bash
npm install
```

## Running the Application

You need to run two servers:

### Terminal 1: Start Ollama (if not already running)

```bash
ollama serve
```

### Terminal 2: Start the FastAPI Backend

```bash
python api_server.py
```

The API server will start on `http://localhost:8000`

### Terminal 3: Start the React Frontend

```bash
npm start
```

The React app will open in your browser at `http://localhost:3000`

## Usage

1. Make sure Ollama is running (`ollama serve`)
2. Start the backend API server (`python api_server.py`)
3. Start the React frontend (`npm start`)
4. Open your browser to `http://localhost:3000`
5. Start chatting with Nereid!

## Project Structure

```
nereid-therapist-main/
├── src/                    # React frontend source
│   ├── components/         # React components
│   │   ├── Sidebar.js      # Left navigation sidebar
│   │   ├── Chat.js         # Main chat interface
│   │   └── MessageInput.js # Message input component
│   ├── App.js              # Main React app
│   └── index.js            # React entry point
├── public/                 # Public assets
├── api_server.py           # FastAPI backend server
├── ml.py                   # Original terminal-based chat (optional)
├── package.json            # Node.js dependencies
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## Configuration

### Changing the AI Model

Edit `api_server.py` and change the `MODEL` variable:

```python
MODEL = "llama3.2:latest"  # Change to your preferred model
```

### Changing the Port

- Backend: Edit `api_server.py` - change `port=8000` in the uvicorn.run() call
- Frontend: Edit `.env` file (create one) with `PORT=3000`

## Troubleshooting

### "Connection refused" error
- Make sure Ollama is running: `ollama serve`
- Make sure the backend API is running: `python api_server.py`
- Check that the model exists: `ollama list`

### Model not found
- Pull the model: `ollama pull llama3.2:latest`
- Or change the model in `api_server.py` to one you have installed

### CORS errors
- Make sure the backend CORS settings in `api_server.py` allow your frontend URL

## License

This project is open source and available for personal use.

