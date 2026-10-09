"""Tests for line-based document chunking strategy and 16 KiB limits."""
from app.db.chunking import LineChunker


def test_chunking_short_document():
    chunker = LineChunker(max_chunk_chars=500, line_overlap=1)
    text = "Line 1: Introduction\nLine 2: Overview\nLine 3: Details"
    chunks = chunker.chunk_text(
        document_id="doc_test_1",
        text=text,
        learner_id="lrn_001",
        is_public=False,
    )
    assert len(chunks) == 1
    assert chunks[0].chunk_id == "doc_test_1_chunk_0"
    assert chunks[0].metadata["document_id"] == "doc_test_1"
    assert chunks[0].metadata["chunk_index"] == 0
    assert chunks[0].metadata["learner_id"] == "lrn_001"


def test_chunking_multi_chunk_overlap():
    chunker = LineChunker(max_chunk_chars=60, line_overlap=1)
    text = "\n".join([f"Line number {i}: descriptive text content" for i in range(10)])
    chunks = chunker.chunk_text(
        document_id="doc_multi",
        text=text,
        learner_id="lrn_002",
        is_public=True,
    )
    assert len(chunks) > 1
    # Check consecutive chunk indices
    for idx, c in enumerate(chunks):
        assert c.chunk_index == idx
        assert c.metadata["chunk_index"] == idx
        assert c.metadata["document_id"] == "doc_multi"
        assert c.byte_size <= 14336  # Strictly below 16 KiB limit


def test_oversized_line_splitting():
    chunker = LineChunker(max_chunk_chars=200, line_overlap=0, max_chunk_bytes=500)
    huge_line = "A" * 1500  # 1500 chars on one line
    chunks = chunker.chunk_text(
        document_id="doc_oversized",
        text=huge_line,
        learner_id="lrn_003",
    )
    assert len(chunks) > 1
    for c in chunks:
        assert len(c.text.encode("utf-8")) <= 500
