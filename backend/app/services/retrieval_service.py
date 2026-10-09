"""Retrieval service performing hybrid vector search with authoritative MongoDB source verification."""
import logging
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.schemas.chat import Citation
from app.db.repositories.core import DocumentRepository
from app.db.repositories.vector import ChromaVectorRepository

logger = logging.getLogger("pathai.services.retrieval")


class RetrievalService:
    """Combines Chroma Cloud hybrid retrieval with authoritative MongoDB source verification."""

    def __init__(self, core_db: AsyncIOMotorDatabase) -> None:
        self.doc_repo = DocumentRepository(core_db)
        self.vector_repo = ChromaVectorRepository()

    async def search_and_verify(
        self,
        learner_id: str,
        query: str,
        limit: int = 5,
        include_public: bool = True,
        skill_tags: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """Search Chroma, verify source passages and access in MongoDB, and return grounded excerpts."""
        raw_results = []
        try:
            raw_results = self.vector_repo.search_hybrid(
                query=query,
                learner_id=learner_id,
                limit=limit * 2,  # Fetch excess to allow for verification filtering
                include_public=include_public,
                skill_tags=skill_tags,
            )
        except Exception as e:
            logger.info("Chroma hybrid search unavailable, using Mongo passage fallback: %s", e)

        verified_passages: List[Dict[str, Any]] = []

        if raw_results:
            for item in raw_results:
                # 1. Authoritative verification against MongoDB
                passage = await self.doc_repo.passages.find_one({"passage_id": item.passage_id})
                if not passage:
                    continue

                # 2. Strict ownership / tenant isolation check
                if not passage.is_public and passage.learner_id != learner_id:
                    logger.warning(
                        "Tenant violation blocked: passage %s does not belong to learner %s",
                        item.passage_id,
                        learner_id,
                    )
                    continue

                # 3. Verify parent document status and extraction quality
                parent_doc = await self.doc_repo.get_document(passage.document_id)
                if parent_doc and parent_doc.status == "failed":
                    continue

                snippet = passage.content_text[:300].strip()
                source_title = parent_doc.filename if parent_doc else f"Document {passage.document_id[:8]}"

                verified_passages.append({
                    "passage_id": passage.passage_id,
                    "document_id": passage.document_id,
                    "source_title": source_title,
                    "page_or_section": passage.section_title or (f"Page {passage.page_number}" if passage.page_number else None),
                    "snippet": snippet,
                    "score": item.score,
                    "is_public": passage.is_public,
                    "skill_tags": passage.skill_tags,
                })

                if len(verified_passages) >= limit:
                    break

        # Fallback to direct MongoDB text matching if vector store returned no verified hits
        if not verified_passages:
            mongo_passages = await self.doc_repo.passages.find_many(
                {
                    "$or": [{"learner_id": learner_id}, {"is_public": True}],
                    "content_text": {"$regex": query, "$options": "i"},
                },
                limit=limit,
            )
            for p in mongo_passages:
                parent_doc = await self.doc_repo.get_document(p.document_id)
                source_title = parent_doc.filename if parent_doc else f"Document {p.document_id[:8]}"
                verified_passages.append({
                    "passage_id": p.passage_id,
                    "document_id": p.document_id,
                    "source_title": source_title,
                    "page_or_section": p.section_title or (f"Page {p.page_number}" if p.page_number else None),
                    "snippet": p.content_text[:300].strip(),
                    "score": 1.0,
                    "is_public": p.is_public,
                    "skill_tags": p.skill_tags,
                })

        return verified_passages

    def to_citations(self, verified_passages: List[Dict[str, Any]]) -> List[Citation]:
        """Convert verified passage dicts to structured Citation models."""
        return [
            Citation(
                passage_id=p["passage_id"],
                document_id=p["document_id"],
                source_title=p["source_title"],
                page_or_section=p["page_or_section"],
                snippet=p["snippet"],
            )
            for p in verified_passages
        ]
