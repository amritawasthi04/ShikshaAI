"""Tests for task plan validation and safety rules."""
import pytest
from app.core.schemas.plan import TaskPlan, TaskItem, WorkerRole
from app.core.execution.validator import validate_task_plan, PlanValidationError


def test_valid_dag_plan():
    tasks = [
        TaskItem(
            task_id="t1",
            worker_role=WorkerRole.CURRICULUM,
            objective="Design milestone roadmap",
            dependencies=[],
            requested_tools=["fetch_profile"],
            output_schema="RoadmapProposalPayload",
        ),
        TaskItem(
            task_id="t2",
            worker_role=WorkerRole.TEACHING,
            objective="Prepare initial lesson",
            dependencies=["t1"],
            requested_tools=["fetch_lesson"],
            output_schema="TeachingContentPayload",
        ),
        TaskItem(
            task_id="t3",
            worker_role=WorkerRole.ASSESSMENT_DESIGN,
            objective="Design comprehension quiz",
            dependencies=["t2"],
            requested_tools=[],
            output_schema="AssessmentDesignPayload",
        ),
    ]
    plan = TaskPlan(
        plan_id="plan_valid",
        overall_objective="Linear learning progression test",
        master_instructions="Execute systematically",
        tasks=tasks,
    )
    # Must validate cleanly without error
    validate_task_plan(plan)


def test_self_dependency_rejected():
    task = TaskItem(
        task_id="self_loop",
        worker_role=WorkerRole.TEACHING,
        objective="Explain circular logic",
        dependencies=["self_loop"],
        requested_tools=[],
        output_schema="TeachingContentPayload",
    )
    plan = TaskPlan(
        plan_id="plan_loop",
        overall_objective="Looping self dependency testing",
        master_instructions="Loop",
        tasks=[task],
    )
    with pytest.raises(PlanValidationError, match="cannot depend on itself"):
        validate_task_plan(plan)


def test_unknown_dependency_rejected():
    task = TaskItem(
        task_id="t1",
        worker_role=WorkerRole.TEACHING,
        objective="Explain concept",
        dependencies=["non_existent_task"],
        requested_tools=[],
        output_schema="TeachingContentPayload",
    )
    plan = TaskPlan(
        plan_id="plan_missing",
        overall_objective="Missing dependency test objective",
        master_instructions="None",
        tasks=[task],
    )
    with pytest.raises(PlanValidationError, match="references unknown dependency"):
        validate_task_plan(plan)


def test_cyclic_dependency_rejected():
    task1 = TaskItem(
        task_id="t1",
        worker_role=WorkerRole.TEACHING,
        objective="Explain part A",
        dependencies=["t2"],
        requested_tools=[],
        output_schema="TeachingContentPayload",
    )
    task2 = TaskItem(
        task_id="t2",
        worker_role=WorkerRole.ASSESSMENT_DESIGN,
        objective="Design part B",
        dependencies=["t1"],
        requested_tools=[],
        output_schema="AssessmentDesignPayload",
    )
    plan = TaskPlan(
        plan_id="plan_cycle",
        overall_objective="Cycle test between two tasks",
        master_instructions="Cycle",
        tasks=[task1, task2],
    )
    with pytest.raises(PlanValidationError, match="Cyclic dependency detected"):
        validate_task_plan(plan)


def test_forbidden_tool_rejected():
    task = TaskItem(
        task_id="t1",
        worker_role=WorkerRole.TEACHING,
        objective="Try to drop DB",
        dependencies=[],
        requested_tools=["drop_collection"],
        output_schema="TeachingContentPayload",
    )
    plan = TaskPlan(
        plan_id="plan_forbidden",
        overall_objective="Hacking attempt verification",
        master_instructions="None",
        tasks=[task],
    )
    with pytest.raises(PlanValidationError, match="strictly forbidden tool"):
        validate_task_plan(plan)
