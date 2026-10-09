"""Vector repository integrating Chroma Cloud for hybrid passage search and chunking."""
import logging
from typing import Any, Dict, List, Optional
from app.db.chroma_client import ChromaManager, chroma_manager
from app.db.models.vector import VectorSearchResult

logger = logging.getLogger("pathai.db.repositories.vector")


class ChromaVectorRepository:
    """Repository wrapping Chroma Cloud hybrid vector retrieval operations."""

    def __init__(self, manager: Optional[ChromaManager] = None) -> None:
        self.manager = manager or chroma_manager

    def index_document(
        self,
        document_id: str,
        text: str,
        learner_id: str,
        is_public: bool = False,
        extra_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[str]:
        """Index document content using line-based chunking into the appropriate Chroma Cloud collection."""
        return self.manager.add_document(
            document_id=document_id,
            content=text,
            learner_id=learner_id,
            is_public=is_public,
            extra_metadata=extra_metadata,
        )

    def search_hybrid(
        self,
        query: str,
        learner_id: str,
        limit: int = 10,
        include_public: bool = True,
        document_ids: Optional[List[str]] = None,
        skill_tags: Optional[List[str]] = None,
        deduplicate_documents: bool = True,
    ) -> List[VectorSearchResult]:
        """Search passages using Chroma Cloud RRF (Dense Qwen + Sparse Splade) and GroupBy deduplication."""
        return self.manager.search_hybrid(
            query=query,
            learner_id=learner_id,
            limit=limit,
            include_public=include_public,
            document_ids=document_ids,
            skill_tags=skill_tags,
            deduplicate_documents=deduplicate_documents,
        )

    def delete_document(self, document_id: str, learner_id: str) -> None:
        """Remove document chunks from Chroma Cloud."""
        self.manager.delete_document(document_id=document_id, learner_id=learner_id)

    def delete_learner(self, learner_id: str) -> None:
        """Purge all vector data for a specific learner."""
        self.manager.delete_learner_collection(learner_id=learner_id)
