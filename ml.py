"""
Nereid - AI Assistant
Terminal chat that provides support and connects users to appropriate resources.
"""

import sys
import json

try:
    import ollama
except ImportError:
    print("Installing ollama package into this Python environment...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "ollama"])
    import ollama

MODEL = "llama3.2:latest"

SYSTEM = """You are Nereid, a compassionate AI companion.
Your role is to:
- Provide a warm, empathetic greeting and create a safe space
- Listen actively and validate feelings without judgment
- Assess what kind of support the person needs
- Offer immediate emotional support for non-crisis situations
- Connect them to appropriate resources (therapist booking, crisis support, self-help tools)
- IMPORTANT: If someone expresses thoughts of self-harm or suicide, immediately provide crisis resources

Guidelines:
- Use warm, supportive language
- Ask gentle, open-ended questions (max 2 at a time)
- Never diagnose or provide medical advice
- Be present and patient
- Normalize seeking help
- Remind them you're an AI, not a replacement for professional care

Crisis resources to share when needed:
- National Suicide Prevention Lifeline: 988 (US)
- Crisis Text Line: Text HOME to 741741
- International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/
"""

ROUTER_PROMPT = """Classify the user's emotional state and support needs into one of:
crisis, high_distress, moderate_distress, seeking_therapist, general_support, 
resource_inquiry, follow_up, unknown

Assess urgency level: immediate, high, moderate, low

Return ONLY valid JSON like:
{"intent":"moderate_distress","urgency":"moderate","emotional_state":"anxious","topics":["work_stress"],"needs_human":"maybe","notes":"..."}
"""

def route(user_text: str) -> dict:
    """Return JSON intent classification."""
    r = ollama.chat(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a compassionate mental health triage classifier. Output ONLY valid JSON."},
            {"role": "user", "content": ROUTER_PROMPT + "\nUser message: " + user_text},
        ],
        options={"temperature": 0},
    )
    content = r["message"]["content"].strip()

    # Guard: sometimes the model wraps JSON in text; try to extract
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # Try extracting first {...} block
        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(content[start:end+1])
        raise

def Nereid_reply(conversation_history: list, user_text: str, route_info: dict) -> str:
    intent = route_info.get("intent", "unknown")
    urgency = route_info.get("urgency", "low")
    emotional_state = route_info.get("emotional_state", "")

    context = (
        f"Support assessment:\n"
        f"- Intent: {intent}\n"
        f"- Urgency: {urgency}\n"
        f"- Emotional state: {emotional_state}\n"
        f"Use this to respond with appropriate care and resources.\n"
    )

    r = ollama.chat(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM},
            *conversation_history,
            {"role": "user", "content": context + "\nUser message: " + user_text},
        ],
        options={"temperature": 0.7},
    )
    return r["message"]["content"]

def interactive_chat():
    print("\n")
    print("~" * 60)
    print("✨ Nereid - AI Assistant")
    print(f"Powered by: {MODEL}")
    print("~" * 60)
    print("Welcome. You're in a safe, judgment-free space.")
    print("Type 'quit' to exit | 'clear' to start fresh\n")
    print("⚠️  If you're in crisis, please call 988 or text HOME to 741741")
    print("~" * 60)

    conversation_history = []

    while True:
        user_input = input("\nYou: ").strip()
        if not user_input:
            continue
        if user_input.lower() in {"quit", "exit", "bye"}:
            print("\nNereid: Thank you for sharing with me. Remember, reaching out is a sign of strength. Take care of yourself. 🌟")
            break
        if user_input.lower() == "clear":
            conversation_history = []
            print("\nConversation reset. I'm here whenever you need to talk.\n")
            continue

        # Route first
        try:
            route_info = route(user_input)
        except Exception as e:
            print(f"\n[System notice] Connection issue: {e}")
            print("Please ensure Ollama is running: ollama serve\n")
            continue

        # Check for crisis
        if route_info.get("intent") == "crisis" or route_info.get("urgency") == "immediate":
            print("\n⚠️  CRISIS RESOURCES ⚠️")
            print("National Suicide Prevention Lifeline: 988")
            print("Crisis Text Line: Text HOME to 741741")
            print("Emergency Services: 911\n")

        # Respond
        try:
            reply = Nereid_reply(conversation_history, user_input, route_info)
        except Exception as e:
            print(f"\n[System notice] {e}")
            print("Check that the model exists: ollama list\n")
            continue

        # Save conversation
        conversation_history.append({"role": "user", "content": user_input})
        conversation_history.append({"role": "assistant", "content": reply})

        print(f"\nNereid: {reply}")

def single_query(prompt: str):
    route_info = route(prompt)
    reply = Nereid_reply([], prompt, route_info)
    print(f"\nNereid: {reply}")
    print(f"\n[Assessment: {route_info}]")

def main():
    if len(sys.argv) > 1:
        single_query(" ".join(sys.argv[1:]))
    else:
        interactive_chat()

if __name__ == "__main__":
    main()