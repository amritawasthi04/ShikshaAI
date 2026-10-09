"""Document and Knowledge service managing authoritative passages and hybrid vector search."""
import hashlib
import logging
import uuid
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.schemas.api import RegisterDocumentRequest, SearchPassagesRequest
from app.db.chunking import LineChunker
from app.db.models.core import DocumentModel, DocumentPassageModel
from app.db.repositories.core import DocumentRepository
from app.db.repositories.vector import ChromaVectorRepository

logger = logging.getLogger("pathai.services.document")


class DocumentService:
    def __init__(self, core_db: AsyncIOMotorDatabase) -> None:
        self.doc_repo = DocumentRepository(core_db)
        self.vector_repo = ChromaVectorRepository()
        self.chunker = LineChunker()

    async def register_document(self, learner_id: str, req: RegisterDocumentRequest) -> DocumentModel:
        content_hash = hashlib.sha256(req.content_text.encode("utf-8")).hexdigest()

        # Check existing by content hash
        existing = await self.doc_repo.get_by_content_hash(learner_id, content_hash)
        if existing:
            return existing

        doc_id = f"doc_{uuid.uuid4().hex[:8]}"
        doc = DocumentModel(
            document_id=doc_id,
            learner_id=learner_id,
            filename=req.filename,
            storage_key=f"uploads/{learner_id}/{doc_id}",
            content_hash=content_hash,
            mime_type=req.mime_type,
            file_size_bytes=len(req.content_text.encode("utf-8")),
            extraction_quality=1.0,
            status="indexed",
        )
        await self.doc_repo.register_document(doc)

        # Chunk and create authoritative passages in Mongo
        chunks = self.chunker.chunk_text(
            document_id=doc_id,
            text=req.content_text,
            learner_id=learner_id,
            is_public=req.is_public,
        )

        passages = [
            DocumentPassageModel(
                passage_id=c.chunk_id,
                document_id=doc_id,
                learner_id=learner_id,
                passage_index=i,
                content_text=c.text,
                is_public=req.is_public,
                skill_tags=req.skill_tags,
                extraction_quality=1.0,
            )
            for i, c in enumerate(chunks)
        ]
        if passages:
            await self.doc_repo.save_passages(passages)

        # Index in Chroma vector store (gracefully catch if vector store is unavailable)
        try:
            self.vector_repo.index_document(
                document_id=doc_id,
                text=req.content_text,
                learner_id=learner_id,
                is_public=req.is_public,
                extra_metadata={"skill_tags": req.skill_tags},
            )
        except Exception as e:
            logger.warning(f"Vector indexing deferred or skipped for {doc_id}: {e}")

        return doc

    async def list_documents(self, learner_id: str) -> List[DocumentModel]:
        return await self.doc_repo.documents.find_many({"learner_id": learner_id})

    async def get_document(self, learner_id: str, document_id: str) -> Optional[DocumentModel]:
        doc = await self.doc_repo.get_document(document_id)
        if doc and doc.learner_id == learner_id:
            return doc
        return None

    async def get_passages(self, document_id: str) -> List[DocumentPassageModel]:
        return await self.doc_repo.get_passages_by_document(document_id)

    async def search_passages(self, learner_id: str, req: SearchPassagesRequest) -> List[Dict[str, Any]]:
        """Hybrid search via Chroma Cloud, falling back to Mongo text matches."""
        results: List[Dict[str, Any]] = []
        try:
            vector_results = self.vector_repo.search_hybrid(
                query=req.query,
                learner_id=learner_id,
                limit=req.limit,
                include_public=req.include_public,
                skill_tags=req.skill_tags,
            )
            for r in vector_results:
                results.append({
                    "passage_id": r.passage_id,
                    "document_id": r.document_id,
                    "content_text": r.content_text,
                    "score": r.score,
                    "skill_tags": r.skill_tags,
                    "is_public": r.is_public,
                })
        except Exception as e:
            logger.info(f"Vector search falling back to Mongo text lookup: {e}")
            mongo_passages = await self.doc_repo.passages.find_many(
                {
                    "$or": [{"learner_id": learner_id}, {"is_public": True}],
                    "content_text": {"$regex": req.query, "$options": "i"},
                },
                limit=req.limit,
            )
            for p in mongo_passages:
                results.append({
                    "passage_id": p.passage_id,
                    "document_id": p.document_id,
                    "content_text": p.content_text,
                    "score": 1.0,
                    "skill_tags": p.skill_tags,
                    "is_public": p.is_public,
                })

        return results
