"""Backend policy definitions governing tool grants and forbidden operations."""
from typing import Dict, List, Set
from app.core.schemas.plan import WorkerRole, ToolGroup

# Allowed tool groups mapped to worker roles (least privilege)
ROLE_TOOL_GRANTS: Dict[WorkerRole, Set[ToolGroup]] = {
    WorkerRole.CURRICULUM: {
        ToolGroup.LEARNER_RECORDS,
        ToolGroup.KNOWLEDGE,
        ToolGroup.PROPOSALS,
    },
    WorkerRole.TEACHING: {
        ToolGroup.LEARNER_RECORDS,
        ToolGroup.KNOWLEDGE,
    },
    WorkerRole.ASSESSMENT_DESIGN: {
        ToolGroup.LEARNER_RECORDS,
        ToolGroup.KNOWLEDGE,
        ToolGroup.ASSESSMENT,
    },
    WorkerRole.ASSESSMENT_EVALUATION: {
        ToolGroup.ASSESSMENT,
        ToolGroup.COMPUTATION,
    },
    WorkerRole.CODE_COACH: {
        ToolGroup.COMPUTATION,
        ToolGroup.ARTIFACTS,
    },
    WorkerRole.PROJECT_MENTOR: {
        ToolGroup.ASSESSMENT,
        ToolGroup.ARTIFACTS,
    },
    WorkerRole.ADAPTATION: {
        ToolGroup.LEARNER_RECORDS,
        ToolGroup.PROPOSALS,
    },
    WorkerRole.SUMMARIZATION: {
        ToolGroup.LEARNER_RECORDS,
        ToolGroup.KNOWLEDGE,
    },
}

# Strictly forbidden tool names or system capabilities
FORBIDDEN_TOOLS: Set[str] = {
    "run_arbitrary_query",
    "raw_database_access",
    "drop_collection",
    "get_db_credentials",
    "shell_exec",
    "export_private_rubrics",
}


def is_tool_allowed_for_role(role: WorkerRole, tool_name: str, tool_group: ToolGroup) -> bool:
    """Verifies whether a tool group is authorized for a specific worker role."""
    if tool_name in FORBIDDEN_TOOLS:
        return False
    allowed_groups = ROLE_TOOL_GRANTS.get(role, set())
    return tool_group in allowed_groups
