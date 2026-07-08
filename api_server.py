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
import json
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
    analysis: Optional[dict] = None

ROUTER_PROMPT = """Classify the user's emotional state and support needs into one of:
crisis, high_distress, moderate_distress, seeking_therapist, general_support, 
resource_inquiry, follow_up, unknown

Assess urgency level: immediate, high, moderate, low

Return ONLY valid JSON like:
{"intent":"moderate_distress","urgency":"moderate","emotional_state":"anxious","topics":["work_stress"],"needs_human":"maybe","notes":"..."}
"""

def local_fallback_route(user_text: str) -> dict:
    """Fallback classifier using keyword matching."""
    text_lower = user_text.lower()
    
    # 1. Check for crisis
    crisis_keywords = ["suicide", "kill myself", "end my life", "self harm", "want to die", "hurt myself", "cut myself", "commit suicide"]
    if any(kw in text_lower for kw in crisis_keywords):
        return {
            "intent": "crisis",
            "urgency": "immediate",
            "emotional_state": "crisis",
            "topics": ["crisis", "self-harm"],
            "needs_human": "yes",
            "notes": "Triggered by crisis keyword detection."
        }
        
    # 2. Check for high distress
    high_distress_keywords = ["panic attack", "panic", "hate my life", "cannot take it", "so depressed", "worthless", "hopeless", "despair"]
    if any(kw in text_lower for kw in high_distress_keywords):
        return {
            "intent": "high_distress",
            "urgency": "high",
            "emotional_state": "overwhelmed",
            "topics": ["depression", "anxiety"],
            "needs_human": "maybe",
            "notes": "Triggered by high distress keyword detection."
        }

    # 3. Check for moderate distress
    intent = "general_support"
    urgency = "low"
    emotional_state = "neutral"
    topics = []
    
    if any(kw in text_lower for kw in ["anxious", "anxiety", "stressed", "stress", "worried", "worry"]):
        intent = "moderate_distress"
        urgency = "moderate"
        emotional_state = "anxious"
        topics.append("anxiety")
        if "work" in text_lower or "job" in text_lower:
            topics.append("work_stress")
    elif any(kw in text_lower for kw in ["sad", "unhappy", "lonely", "crying"]):
        intent = "moderate_distress"
        urgency = "moderate"
        emotional_state = "sad"
        topics.append("sadness")
    elif "sleep" in text_lower or "insomnia" in text_lower or "nightmare" in text_lower:
        intent = "resource_inquiry"
        urgency = "low"
        emotional_state = "tired"
        topics.append("sleep")
    elif "therapist" in text_lower or "counselor" in text_lower or "doctor" in text_lower:
        intent = "seeking_therapist"
        urgency = "moderate"
        emotional_state = "seeking_help"
        topics.append("professional_help")
    
    if not topics:
        topics = ["general"]
        
    return {
        "intent": intent,
        "urgency": urgency,
        "emotional_state": emotional_state,
        "topics": topics,
        "needs_human": "maybe" if urgency == "moderate" else "no",
        "notes": "Analyzed using local keyword heuristics."
    }

def route_sentiment(user_text: str) -> dict:
    """Return JSON intent classification, falling back to keywords on failure."""
    try:
        r = ollama.chat(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a compassionate mental health triage classifier. Output ONLY valid JSON."},
                {"role": "user", "content": ROUTER_PROMPT + "\nUser message: " + user_text},
            ],
            options={"temperature": 0},
        )
        content = r["message"]["content"].strip()
        
        # Guard: extract JSON block if wrapped
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            start = content.find("{")
            end = content.rfind("}")
            if start != -1 and end != -1 and end > start:
                return json.loads(content[start:end+1])
            raise
    except Exception as e:
        print(f"Ollama routing failed: {e}. Using local keyword fallback.")
        return local_fallback_route(user_text)

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
        
        # Analyze the user's emotional state
        analysis = route_sentiment(request.message.strip())
        
        return ChatResponse(reply=reply, success=True, analysis=analysis)
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

