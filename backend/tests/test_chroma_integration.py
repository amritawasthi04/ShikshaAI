"""Integration tests for Chroma Cloud hybrid search, RRF, and GroupBy deduplication."""
import pytest
from app.db.chroma_client import chroma_manager
from app.db.repositories.vector import ChromaVectorRepository


def test_chroma_cloud_ping():
    res = chroma_manager.ping()
    assert res["status"] == "ok"
    assert "heartbeat" in res
    assert res["tenant"] is not None


def test_chroma_hybrid_indexing_and_search():
    vector_repo = ChromaVectorRepository(chroma_manager)

    test_learner = "test_learner_vector_01"
    doc_id = "doc_test_vector_intro"

    # Multi-line document about binary search and algorithms
    content = (
        "Binary search algorithm finds the position of a target value within a sorted array.\n"
        "Binary search compares the target value to the middle element of the array.\n"
        "If they are not equal, the half in which the target cannot lie is eliminated.\n"
        "The search continues on the remaining half until the target is found or subarray empty.\n"
        "The worst-case time complexity of binary search is logarithmic O(log n)."
    )

    chunk_ids = vector_repo.index_document(
        document_id=doc_id,
        text=content,
        learner_id=test_learner,
        is_public=False,
        extra_metadata={"skill_tags": ["Algorithms", "Binary Search"]},
    )
    assert len(chunk_ids) >= 1

    # Execute Hybrid Search (Dense Qwen + Sparse Splade with RRF and GroupBy deduplication)
    results = vector_repo.search_hybrid(
        query="What is the worst-case time complexity of binary search?",
        learner_id=test_learner,
        limit=5,
        include_public=False,
        deduplicate_documents=True,
    )

    assert len(results) >= 1
    # Check that the returned result references the indexed document
    assert results[0].document_id == doc_id
    assert "binary search" in results[0].content_text.lower()

    # Cleanup test document from Chroma Cloud
    vector_repo.delete_document(document_id=doc_id, learner_id=test_learner)
    # Purge the test learner collection
    vector_repo.delete_learner(learner_id=test_learner)
