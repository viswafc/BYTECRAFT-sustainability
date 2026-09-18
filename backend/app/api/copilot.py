from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.ml.copilot.agent import CopilotAgent

router = APIRouter()
copilot_agent = CopilotAgent()

class ChatRequest(BaseModel):
    message: str

@router.post("/api/copilot/chat")
def chat(req: ChatRequest):
    return copilot_agent.generate_response(req.message)
