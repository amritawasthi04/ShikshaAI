"""Chroma Cloud client and hybrid vector search manager."""
import logging
import os
import re
import time
from typing import Any, Dict, List, Optional
import chromadb
from chromadb import K, Knn, Rrf, Schema, Search, SparseVectorIndexConfig, VectorIndexConfig
from chromadb.execution.expression import GroupBy, MinK
from chromadb.utils.embedding_functions.chroma_cloud_qwen_embedding_function import (
    ChromaCloudQwenEmbeddingFunction,
    ChromaCloudQwenEmbeddingModel,
)
from chromadb.utils.embedding_functions.chroma_cloud_splade_embedding_function import (
    ChromaCloudSpladeEmbeddingFunction,
    ChromaCloudSpladeEmbeddingModel,
)

from app.config import settings
from app.db.chunking import DocumentChunk, LineChunker
from app.db.models.vector import VectorSearchFilter, VectorSearchResult

logger = logging.getLogger("pathai.db.chroma")


class ChromaManager:
    """Manages connections, sharded collections, and hybrid search in Chroma Cloud."""

    def __init__(self) -> None:
        self._client: Optional[chromadb.api.ClientAPI] = None
        self._mock_client: Optional[chromadb.api.ClientAPI] = None
        self._chunker = LineChunker()
        self._qwen_ef: Optional[ChromaCloudQwenEmbeddingFunction] = None
        self._splade_ef: Optional[ChromaCloudSpladeEmbeddingFunction] = None

    @property
    def client(self) -> chromadb.api.ClientAPI:
        if self._mock_client is not None:
            return self._mock_client
        if self._client is None:
            self.connect()
        return self._client

    def connect(self) -> None:
        """Initialize Chroma Cloud client using configured credentials."""
        if self._client is not None:
            return

        api_key = settings.CHROMA_API_KEY or os.environ.get("CHROMA_API_KEY")
        tenant = settings.CHROMA_TENANT or os.environ.get("CHROMA_TENANT")
        database = settings.CHROMA_DATABASE or os.environ.get("CHROMA_DATABASE", "default")
        host = settings.CHROMA_HOST or os.environ.get("CHROMA_HOST", "api.trychroma.com")

        if api_key:
            os.environ["CHROMA_API_KEY"] = api_key

        logger.info("Connecting to Chroma Cloud (tenant: %s, db: %s)", tenant, database)
        if tenant and api_key:
            self._client = chromadb.CloudClient(
                tenant=tenant,
                database=database,
                api_key=api_key,
                cloud_host=host,
            )
        else:
            # Fallback to standard CloudClient resolving from env
            self._client = chromadb.CloudClient()

    def set_mock_client(self, mock_client: chromadb.api.ClientAPI) -> None:
        """Inject ephemeral or mock client for testing."""
        self._mock_client = mock_client

    def reset_mocks(self) -> None:
        """Clear mock client."""
        self._mock_client = None

    def get_dense_embedding_function(self) -> ChromaCloudQwenEmbeddingFunction:
        """Return Chroma Cloud Qwen embedding function (nl_to_code)."""
        if self._qwen_ef is None:
            api_key = settings.CHROMA_API_KEY or os.environ.get("CHROMA_API_KEY")
            if api_key:
                os.environ["CHROMA_API_KEY"] = api_key
            self._qwen_ef = ChromaCloudQwenEmbeddingFunction(
                model=ChromaCloudQwenEmbeddingModel.QWEN3_EMBEDDING_0p6B,
                task="nl_to_code",
            )
        return self._qwen_ef

    def get_sparse_embedding_function(self) -> ChromaCloudSpladeEmbeddingFunction:
        """Return Chroma Cloud Splade sparse embedding function."""
        if self._splade_ef is None:
            api_key = settings.CHROMA_API_KEY or os.environ.get("CHROMA_API_KEY")
            if api_key:
                os.environ["CHROMA_API_KEY"] = api_key
            self._splade_ef = ChromaCloudSpladeEmbeddingFunction(
                model=ChromaCloudSpladeEmbeddingModel.SPLADE_PP_EN_V1,
            )
        return self._splade_ef

    def build_collection_schema(self) -> Schema:
        """Build a Chroma Schema with dense Qwen cosine index and sparse Splade keyword index."""
        schema = Schema()
        # Dense vector index with Qwen embeddings over K.DOCUMENT
        schema.create_index(
            VectorIndexConfig(
                space="cosine",
                embedding_function=self.get_dense_embedding_function(),
            )
        )
        # Sparse vector index with Splade embeddings for exact keyword and terminology matching
        schema.create_index(
            config=SparseVectorIndexConfig(
                source_key=K.DOCUMENT,
                embedding_function=self.get_sparse_embedding_function(),
            ),
            key="sparse_embedding",
        )
        return schema

    @staticmethod
    def sanitize_collection_name(name: str) -> str:
        """Ensure collection name meets Chroma naming guidelines (3-63 chars, alphanumeric, _ or -)."""
        clean = re.sub(r"[^a-zA-Z0-9_-]", "_", name)
        clean = clean.strip("_-")
        if len(clean) < 3:
            clean = f"col_{clean}"
        return clean[:63]

    def get_learner_collection_name(self, learner_id: str) -> str:
        """Generate isolated collection name for an individual learner."""
        return self.sanitize_collection_name(f"shiksha_learner_{learner_id}")

    @property
    def public_collection_name(self) -> str:
        """Name of the shared public knowledge collection."""
        return settings.CHROMA_PUBLIC_COLLECTION

    def get_or_create_collection(self, name: str) -> Any:
        """Get or create collection with dense + sparse Schema in Chroma Cloud."""
        safe_name = self.sanitize_collection_name(name)
        schema = self.build_collection_schema()
        return self.client.get_or_create_collection(
            name=safe_name,
            schema=schema,
            embedding_function=None,
        )

    def get_learner_collection(self, learner_id: str) -> Any:
        """Return or create the sharded collection for a specific learner."""
        coll_name = self.get_learner_collection_name(learner_id)
        return self.get_or_create_collection(coll_name)

    def get_public_collection(self) -> Any:
        """Return or create the shared public knowledge collection."""
        return self.get_or_create_collection(self.public_collection_name)

    def add_document(
        self,
        document_id: str,
        content: str,
        learner_id: str,
        is_public: bool = False,
        extra_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[str]:
        """Chunk a document and index its chunks into the appropriate Chroma Cloud collection."""
        chunks = self._chunker.chunk_text(
            document_id=document_id,
            text=content,
            learner_id=learner_id,
            is_public=is_public,
            extra_metadata=extra_metadata,
        )
        if not chunks:
            return []

        ids = [c.chunk_id for c in chunks]
        documents = [c.text for c in chunks]
        metadatas = [c.metadata for c in chunks]

        # Target sharded collection: private learner collection or public collection
        collection = self.get_public_collection() if is_public else self.get_learner_collection(learner_id)
        collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
        logger.info(
            "Indexed document %s (%d chunks) into %s",
            document_id,
            len(chunks),
            collection.name,
        )
        return ids

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
        """Execute hybrid search using RRF (Dense Qwen + Sparse Splade) with GroupBy deduplication."""
        collections_to_search = []
        try:
            learner_coll = self.get_learner_collection(learner_id)
            collections_to_search.append(learner_coll)
        except Exception as e:
            logger.warning("Could not access learner collection for %s: %s", learner_id, e)

        if include_public:
            try:
                public_coll = self.get_public_collection()
                if public_coll not in collections_to_search:
                    collections_to_search.append(public_coll)
            except Exception as e:
                logger.warning("Could not access public collection: %s", e)

        results: List[VectorSearchResult] = []

        # Build RRF ranking expression merging Dense Qwen & Sparse Splade rankings
        rrf = Rrf([
            Knn(query=query, return_rank=True),
            Knn(query=query, key="sparse_embedding", return_rank=True),
        ])

        for coll in collections_to_search:
            try:
                # Build Search pipeline
                search = Search().rank(rrf)

                # Metadata filtering where appropriate
                if document_ids and len(document_ids) == 1:
                    search = search.where(K("document_id") == document_ids[0])

                # Apply GroupBy deduplication across chunks of the same document
                if deduplicate_documents:
                    search = search.group_by(
                        GroupBy(
                            keys=K("document_id"),
                            aggregate=MinK(keys=K.SCORE, k=1),
                        )
                    )

                search = search.limit(limit).select(K.DOCUMENT, K.SCORE, K.METADATA)

                search_res = coll.search(search)
                rows = search_res.rows()
                if not rows or not rows[0]:
                    continue

                for row in rows[0]:
                    meta = row.get("metadata") or {}
                    doc_id = meta.get("document_id") or row.get("id")
                    chunk_text = row.get("document") or ""
                    score = float(row.get("score", 0.0))
                    tags = meta.get("skill_tags") or []
                    if isinstance(tags, str):
                        tags = [tags]

                    results.append(
                        VectorSearchResult(
                            passage_id=row.get("id", doc_id),
                            score=score,
                            document_id=doc_id,
                            learner_id=meta.get("learner_id", learner_id),
                            page_or_section=meta.get("page_or_section"),
                            content_text=chunk_text,
                            skill_tags=tags,
                            is_public=bool(meta.get("is_public", False)),
                        )
                    )
            except Exception as exc:
                logger.error("Error searching collection %s: %s", coll.name, exc)

        # Sort combined results by score ascending (lower score is better in Chroma RRF)
        results.sort(key=lambda r: r.score)

        # Global deduplication across collections if needed
        if deduplicate_documents:
            seen_docs = set()
            deduped = []
            for r in results:
                if r.document_id not in seen_docs:
                    seen_docs.add(r.document_id)
                    deduped.append(r)
            return deduped[:limit]

        return results[:limit]

    def delete_document(self, document_id: str, learner_id: str) -> None:
        """Delete all chunks for a document across learner and public collections."""
        for coll in [self.get_learner_collection(learner_id), self.get_public_collection()]:
            try:
                coll.delete(where={"document_id": document_id})
                logger.info("Deleted document %s from %s", document_id, coll.name)
            except Exception as exc:
                logger.debug("Document deletion notice for %s in %s: %s", document_id, coll.name, exc)

    def delete_learner_collection(self, learner_id: str) -> None:
        """Purge an entire learner sharded collection upon account erasure."""
        coll_name = self.get_learner_collection_name(learner_id)
        try:
            self.client.delete_collection(coll_name)
            logger.info("Deleted learner collection %s", coll_name)
        except Exception as exc:
            logger.warning("Could not delete learner collection %s: %s", coll_name, exc)

    def ping(self) -> Dict[str, Any]:
        """Perform health and latency check against Chroma Cloud."""
        if self._mock_client is not None:
            return {"status": "ok", "latency_ms": 0.0, "mock": True}

        start = time.perf_counter()
        try:
            client = self.client
            heartbeat = client.heartbeat()
            collections = client.list_collections()
            latency_ms = (time.perf_counter() - start) * 1000.0
            return {
                "status": "ok",
                "latency_ms": round(latency_ms, 2),
                "heartbeat": heartbeat,
                "collection_count": len(collections),
                "tenant": settings.CHROMA_TENANT,
                "database": settings.CHROMA_DATABASE,
            }
        except Exception as exc:
            return {
                "status": "error",
                "error": str(exc),
                "tenant": settings.CHROMA_TENANT,
            }


# Global singleton instance
chroma_manager = ChromaManager()
