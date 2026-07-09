"""
FastAPI server for Nereid AI Chat Interface
Connects React frontend to Ollama AI backend
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
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
    style: Optional[str] = "reflective"
    profile_context: Optional[str] = ""

class ChatResponse(BaseModel):
    reply: str
    success: bool = True
    analysis: Optional[dict] = None

class JournalAnalyzeRequest(BaseModel):
    text: str

class JournalAnalyzeResponse(BaseModel):
    success: bool = True
    analysis: Optional[dict] = None

class ProfileUpdate(BaseModel):
    new_stressors: List[str] = []
    new_coping_worked: List[str] = []
    new_coping_didnt_work: List[str] = []
    new_context: List[str] = []
    reinforced_existing_ids: List[str] = []

class SummarizeRequest(BaseModel):
    session_id: str
    messages: List[ChatMessage]
    current_profile: Optional[dict] = None

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

STYLE_PROMPTS = {
    "reflective": """
[STYLE: Reflective Listening]
- Mirror and validate the user's feelings.
- Ask gentle, open-ended questions.
- Avoid offering direct solutions, advice, or fixing their problems unless explicitly asked.
""",
    "cbt": """
[STYLE: CBT-style Reframing]
- Gently identify cognitive distortions (like all-or-nothing thinking, catastrophizing).
- Offer alternative, balanced reframes for their thoughts.
- Ask questions to examine evidence for and against their distressing thoughts.
""",
    "venting": """
[STYLE: Venting / No Advice]
- Do NOT suggest solutions, advice, coping strategies, or reframes.
- Acknowledge their venting, validate their frustration/pain, and show you are fully present and listening.
- Keep responses focused on presence and supportive validation.
"""
}

def get_nereid_reply(conversation_history: List[Dict], user_text: str, style: str = "reflective", profile_context: str = "") -> str:
    """Get Nereid's reply using Ollama."""
    style_fragment = STYLE_PROMPTS.get(style, STYLE_PROMPTS["reflective"])
    combined_system = SYSTEM + "\n" + style_fragment
    if profile_context and profile_context.strip():
        combined_system += "\n" + profile_context
    messages = [
        {"role": "system", "content": combined_system},
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

@app.get("/api/styles")
def get_styles():
    return [
        {"id": "reflective", "name": "Reflective Listening", "description": "Mirrors and validates your feelings, asking gentle questions. Avoids giving solutions unless asked."},
        {"id": "cbt", "name": "CBT Reframing", "description": "Gently explores cognitive distortions, offering balanced reframes and examining evidence."},
        {"id": "venting", "name": "Venting / No Advice", "description": "A quiet, supportive listening ear. Strictly avoids suggesting coping strategies or reframes unless prompted."}
    ]
@app.post("/api/journal/analyze", response_model=JournalAnalyzeResponse)
async def analyze_journal(request: JournalAnalyzeRequest):
    """
    Endpoint for analyzing a journal entry's sentiment and urgency
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Journal entry text cannot be empty")
    
    try:
        analysis = route_sentiment(request.text.strip())
        return JournalAnalyzeResponse(success=True, analysis=analysis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing journal entry: {str(e)}")


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
        
        reply = get_nereid_reply(
            history,
            request.message.strip(),
            request.style or "reflective",
            request.profile_context or ""
        )
        
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
@app.post("/api/sessions/{session_id}/summarize")
async def summarize_session(session_id: str, request: SummarizeRequest, background_tasks: BackgroundTasks):
    """
    Triggered when a chat session ends. Runs summarization in the background
    so it doesn't block the UI. Returns immediately with a 202 Accepted.
    """
    background_tasks.add_task(_run_summarization, session_id, request.messages, request.current_profile or {})
    return {"accepted": True, "session_id": session_id}

def _run_summarization(session_id: str, messages: List[ChatMessage], current_profile: dict):
    """
    Background task: prompt the LLM to return a structured ProfileUpdate diff
    based on this session's messages and the existing profile.
    """
    try:
        conversation_text = "\n".join(
            f"{msg.role.upper()}: {msg.content}" for msg in messages if hasattr(msg, 'role')
        )
        profile_summary = ""
        if current_profile:
            stressors = [i.get('text', '') for i in current_profile.get('recurringStressors', [])[:5]]
            if stressors:
                profile_summary = f"Existing known stressors: {', '.join(stressors)}"

        prompt = f"""You are analyzing a therapy support conversation to extract structured insights.

Conversation transcript:
{conversation_text}

{profile_summary}

Extract insights as a JSON object with exactly these keys:
- new_stressors: list of new recurring stressors mentioned (short phrases, max 5)
- new_coping_worked: list of coping strategies that the user said worked or seemed helpful (short phrases, max 3)
- new_coping_didnt_work: list of coping strategies that didn't help (short phrases, max 3)
- new_context: list of ongoing contextual situations worth remembering (short phrases, max 3)
- reinforced_existing_ids: always an empty list []

Return ONLY valid JSON, nothing else."""

        response = ollama.chat(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            options={"temperature": 0.1},
        )
        raw = response["message"]["content"]

        # Extract JSON from response
        start = raw.find('{')
        end = raw.rfind('}') + 1
        if start != -1 and end > start:
            diff = json.loads(raw[start:end])
            diff["sessionId"] = session_id
            print(f"[SUMMARIZE] Session {session_id} → diff: {diff}")
            # The diff is returned via polling from the client (stored in memory cache)
            # For simplicity, log it — the client can call GET /api/sessions/{id}/profile-diff
            _profile_diff_cache[session_id] = diff
    except Exception as e:
        print(f"[SUMMARIZE ERROR] Session {session_id}: {e}")

# Simple in-memory cache for profile diffs (cleared on server restart)
_profile_diff_cache = {}

@app.get("/api/sessions/{session_id}/profile-diff")
def get_profile_diff(session_id: str):
    """
    Client polls this after calling /summarize. Returns the diff if ready,
    or 204 No Content if still processing.
    """
    diff = _profile_diff_cache.pop(session_id, None)
    if diff is None:
        return {"ready": False}
    return {"ready": True, "diff": diff}


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

