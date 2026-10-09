"""Document registration, authoritative passage retrieval, and hybrid search endpoints."""
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_learner_id, get_document_service
from app.core.schemas.api import RegisterDocumentRequest, SearchPassagesRequest
from app.db.models.core import DocumentModel, DocumentPassageModel
from app.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents & Knowledge"])


@router.post("", response_model=DocumentModel, status_code=status.HTTP_201_CREATED)
async def register_document(
    req: RegisterDocumentRequest,
    learner_id: str = Depends(get_current_learner_id),
    service: DocumentService = Depends(get_document_service),
):
    """Upload/register learning document, chunking passages and indexing in vector store."""
    return await service.register_document(learner_id, req)


@router.get("", response_model=List[DocumentModel])
async def list_documents(
    learner_id: str = Depends(get_current_learner_id),
    service: DocumentService = Depends(get_document_service),
):
    """List documents belonging to current learner."""
    return await service.list_documents(learner_id)


@router.get("/{document_id}", response_model=DocumentModel)
async def get_document(
    document_id: str,
    learner_id: str = Depends(get_current_learner_id),
    service: DocumentService = Depends(get_document_service),
):
    """Get metadata for a single document."""
    doc = await service.get_document(learner_id, document_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc


@router.get("/{document_id}/passages", response_model=List[DocumentPassageModel])
async def get_document_passages(
    document_id: str,
    learner_id: str = Depends(get_current_learner_id),
    service: DocumentService = Depends(get_document_service),
):
    """Retrieve indexed passages for a document."""
    doc = await service.get_document(learner_id, document_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return await service.get_passages(document_id)


@router.post("/search")
async def search_passages(
    req: SearchPassagesRequest,
    learner_id: str = Depends(get_current_learner_id),
    service: DocumentService = Depends(get_document_service),
):
    """Hybrid semantic vector and keyword search across authorized knowledge passages."""
    return await service.search_passages(learner_id, req)
