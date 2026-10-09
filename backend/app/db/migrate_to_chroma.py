"""Migration script for copying and embedding existing MongoDB documents/passages into Chroma Cloud."""
import asyncio
import logging
from typing import Any, Dict
from app.db.chroma_client import chroma_manager
from app.db.chunking import LineChunker
from app.db.connection import mongo_manager

logger = logging.getLogger("pathai.db.migration")


async def migrate_mongo_to_chroma(batch_size: int = 50) -> Dict[str, Any]:
    """Scan authoritative documents and passages from MongoDB pathai_core and embed into Chroma Cloud."""
    core_db = mongo_manager.get_core_db()
    chunker = LineChunker()

    stats = {
        "documents_scanned": 0,
        "passages_scanned": 0,
        "chunks_indexed": 0,
        "collections_updated": set(),
        "errors": [],
    }

    logger.info("Starting migration of stored content from MongoDB to Chroma Cloud...")

    # 1. Process documents collection
    doc_cursor = core_db["documents"].find({})
    async for doc in doc_cursor:
        doc_id = doc.get("document_id")
        learner_id = doc.get("learner_id", "system")
        is_public = doc.get("is_public", False)
        filename = doc.get("filename", "")

        stats["documents_scanned"] += 1

        # Fetch associated passages
        passages = await core_db["document_passages"].find({"document_id": doc_id}).to_list(None)
        if passages:
            for p in passages:
                stats["passages_scanned"] += 1
                text = p.get("content_text", "")
                if not text.strip():
                    continue

                chunk_ids = chroma_manager.add_document(
                    document_id=doc_id,
                    content=text,
                    learner_id=learner_id,
                    is_public=is_public,
                    extra_metadata={
                        "filename": filename,
                        "page_number": p.get("page_number"),
                        "section_title": p.get("section_title"),
                        "skill_tags": p.get("skill_tags", []),
                    },
                )
                stats["chunks_indexed"] += len(chunk_ids)
                target_coll = chroma_manager.public_collection_name if is_public else chroma_manager.get_learner_collection_name(learner_id)
                stats["collections_updated"].add(target_coll)
        else:
            # If document has raw text content directly
            raw_text = doc.get("raw_text") or doc.get("content")
            if raw_text:
                chunk_ids = chroma_manager.add_document(
                    document_id=doc_id,
                    content=raw_text,
                    learner_id=learner_id,
                    is_public=is_public,
                    extra_metadata={"filename": filename},
                )
                stats["chunks_indexed"] += len(chunk_ids)
                target_coll = chroma_manager.public_collection_name if is_public else chroma_manager.get_learner_collection_name(learner_id)
                stats["collections_updated"].add(target_coll)

    stats["collections_updated"] = list(stats["collections_updated"])
    logger.info("Chroma Cloud migration complete: %s", stats)
    return stats


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    result = asyncio.run(migrate_mongo_to_chroma())
    print("Migration finished:")
    print(result)
