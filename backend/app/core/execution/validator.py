"""Task plan validation engine enforcing DAG acyclicity and security constraints."""
from typing import Dict, List, Set
from app.core.schemas.plan import TaskPlan, TaskItem
from app.core.execution.policy import FORBIDDEN_TOOLS


class PlanValidationError(Exception):
    """Raised when a TaskPlan violates topological or security requirements."""
    pass


def validate_task_plan(plan: TaskPlan) -> None:
    """Validates uniqueness, dependency existence, acyclicity, and tool restrictions.

    Raises:
        PlanValidationError: If validation fails.
    """
    task_map: Dict[str, TaskItem] = {task.task_id: task for task in plan.tasks}

    # 1. Check dependency references and self-dependency
    for task in plan.tasks:
        for dep in task.dependencies:
            if dep == task.task_id:
                raise PlanValidationError(f"Task '{task.task_id}' cannot depend on itself")
            if dep not in task_map:
                raise PlanValidationError(
                    f"Task '{task.task_id}' references unknown dependency '{dep}'"
                )

        # 2. Check for forbidden tools
        for tool in task.requested_tools:
            if tool in FORBIDDEN_TOOLS:
                raise PlanValidationError(
                    f"Task '{task.task_id}' requested strictly forbidden tool '{tool}'"
                )

    # 3. Detect cycles in the Directed Acyclic Graph (DAG) using Kahn's Algorithm
    in_degree: Dict[str, int] = {task_id: 0 for task_id in task_map}
    adj_list: Dict[str, List[str]] = {task_id: [] for task_id in task_map}

    for task in plan.tasks:
        for dep in task.dependencies:
            adj_list[dep].append(task.task_id)
            in_degree[task.task_id] += 1

    queue: List[str] = [task_id for task_id, deg in in_degree.items() if deg == 0]
    visited_count = 0

    while queue:
        curr = queue.pop(0)
        visited_count += 1
        for neighbor in adj_list[curr]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if visited_count != len(task_map):
        raise PlanValidationError("Cyclic dependency detected in TaskPlan graph")
