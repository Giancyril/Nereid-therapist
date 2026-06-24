"""
FastAPI server for Nereid AI Chat Interface
Connects React frontend to Ollama AI backend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import sys
import io
# Fix Windows Unicode encoding issues
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

try:
    import ollama
except ImportError:
    print("Installing ollama package into this Python environment...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "ollama"])
    import ollama

app = FastAPI(title="Nereid API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL = "llama3.2:latest"

SYSTEM = """You are Nereid, a compassionate AI companion.
Your role is to:
- Provide a warm, empathetic greeting and create a safe space
- Listen actively and validate feelings without judgment
- Assess what kind of support the person needs
- Offer immediate emotional support for non-crisis situations
- Connect them to appropriate resources when needed
- Be helpful, friendly, and supportive

Guidelines:
- Use warm, supportive language
- Ask gentle, open-ended questions (max 2 at a time)
- Never diagnose or provide medical advice
- Be present and patient
- Normalize seeking help
- Remind them you're an AI assistant designed to help

Always be helpful, kind, and engaging in your responses."""

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    success: bool = True

def get_nereid_reply(conversation_history: List[Dict], user_text: str) -> str:
    """Get Nereid's reply using Ollama."""
    messages = [
        {"role": "system", "content": SYSTEM},
    ]
    
    # Add conversation history
    for msg in conversation_history:
        # Handle both dict and object types
        if isinstance(msg, dict):
            role = msg.get("role", "user")
            content = msg.get("content", "")
        else:
            # Pydantic model or object with attributes
            role = getattr(msg, "role", "user")
            content = getattr(msg, "content", "")
        messages.append({
            "role": role,
            "content": content,
        })
    
    # Add current user message
    messages.append({"role": "user", "content": user_text})
    
    try:
        response = ollama.chat(
            model=MODEL,
            messages=messages,
            options={"temperature": 0.7},
        )
        return response["message"]["content"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with AI model: {str(e)}")

@app.get("/")
def root():
    return {"message": "Nereid API is running", "status": "online"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint - receives user message and returns Nereid's reply
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        # Convert ChatMessage objects to dicts for compatibility
        history: List[Dict[str, str]] = []
        if request.conversation_history:
            for msg in request.conversation_history:
                if isinstance(msg, dict):
                    history.append(msg)
                else:
                    history.append({"role": msg.role, "content": msg.content})
        
        reply = get_nereid_reply(history, request.message.strip())
        return ChatResponse(reply=reply, success=True)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Internal server error: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR: {error_detail}")  # Log to console
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("Nereid API Server")
    print("="*60)
    print(f"Model: {MODEL}")
    print("Starting server on http://localhost:8000")
    print("Make sure Ollama is running: ollama serve")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)

