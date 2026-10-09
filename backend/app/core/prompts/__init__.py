"""Core prompt definitions for Teacher Brain, Workers, and Judges."""
from app.core.prompts.teacher import TEACHER_SYSTEM_PROMPT
from app.core.prompts.worker import WORKER_INSTRUCTION_TEMPLATE
from app.core.prompts.judge import JUDGE_INSTRUCTION_TEMPLATE

__all__ = [
    "TEACHER_SYSTEM_PROMPT",
    "WORKER_INSTRUCTION_TEMPLATE",
    "JUDGE_INSTRUCTION_TEMPLATE",
]
