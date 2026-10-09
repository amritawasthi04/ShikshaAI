"""Execution run tracking, events, and cancellation endpoints."""
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_execution_service
from app.services.execution_service import ExecutionService

router = APIRouter(prefix="/runs", tags=["Execution & Runs"])


@router.get("/{run_id}")
async def get_run_status(
    run_id: str,
    service: ExecutionService = Depends(get_execution_service),
):
    """Get status, tasks, and judge reviews for an execution run."""
    run = await service.get_run_details(run_id)
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    return run


@router.get("/{run_id}/events")
async def get_run_events(
    run_id: str,
    service: ExecutionService = Depends(get_execution_service),
):
    """Retrieve event timeline and execution milestones for a run."""
    run = await service.get_run_details(run_id)
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    return {
        "run_id": run_id,
        "status": run["status"],
        "tasks_count": len(run.get("tasks", [])),
        "reviews_count": len(run.get("judge_reviews", [])),
    }


@router.post("/{run_id}/cancel")
async def cancel_run(
    run_id: str,
    service: ExecutionService = Depends(get_execution_service),
):
    """Cooperatively request cancellation of an active run."""
    ok = await service.cancel_run(run_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    return {"status": "cancelled", "run_id": run_id}
