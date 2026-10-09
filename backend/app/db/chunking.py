"""Document chunking strategies for Chroma Cloud vector ingestion."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DocumentChunk(BaseModel):
    """A bounded text chunk extracted from a source document."""
    chunk_id: str
    document_id: str
    chunk_index: int
    text: str
    byte_size: int
    learner_id: str
    is_public: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LineChunker:
    """Line-based chunking strategy respecting Chroma's 16 KiB per-document limit.

    Chunks text along line boundaries with configurable line overlap, ensuring
    cohesive semantic units and preventing mid-sentence truncation where possible.
    """

    def __init__(
        self,
        max_chunk_chars: int = 1800,
        line_overlap: int = 2,
        max_chunk_bytes: int = 14336,  # ~14 KiB, safely below 16 KiB Chroma limit
    ) -> None:
        self.max_chunk_chars = max_chunk_chars
        self.line_overlap = line_overlap
        self.max_chunk_bytes = max_chunk_bytes

    def chunk_text(
        self,
        document_id: str,
        text: str,
        learner_id: str,
        is_public: bool = False,
        extra_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[DocumentChunk]:
        """Split document text into bounded chunks with metadata for GroupBy deduplication."""
        if not text or not text.strip():
            return []

        extra = extra_metadata or {}
        lines = text.splitlines(keepends=True)
        chunks: List[DocumentChunk] = []

        current_lines: List[str] = []
        current_char_count = 0
        chunk_idx = 0

        i = 0
        while i < len(lines):
            line = lines[i]
            line_len = len(line)

            # If a single line exceeds max bytes, split the oversized line directly
            if len(line.encode("utf-8")) > self.max_chunk_bytes:
                # Flush existing buffer first
                if current_lines:
                    chunk_text = "".join(current_lines).strip()
                    if chunk_text:
                        chunks.append(
                            self._create_chunk(
                                document_id, chunk_idx, chunk_text, learner_id, is_public, extra
                            )
                        )
                        chunk_idx += 1
                    current_lines = []
                    current_char_count = 0

                # Slice large line into safe pieces
                line_chunks = self._slice_oversized_line(line)
                for piece in line_chunks:
                    chunks.append(
                        self._create_chunk(
                            document_id, chunk_idx, piece, learner_id, is_public, extra
                        )
                    )
                    chunk_idx += 1
                i += 1
                continue

            # Check if adding this line would exceed char limit or byte limit
            tentative_text = "".join(current_lines + [line])
            tentative_bytes = len(tentative_text.encode("utf-8"))

            if (current_char_count + line_len > self.max_chunk_chars or tentative_bytes > self.max_chunk_bytes) and current_lines:
                # Emit current chunk
                chunk_text = "".join(current_lines).strip()
                if chunk_text:
                    chunks.append(
                        self._create_chunk(
                            document_id, chunk_idx, chunk_text, learner_id, is_public, extra
                        )
                    )
                    chunk_idx += 1

                # Retain overlap lines for context continuity
                overlap_lines = current_lines[-self.line_overlap :] if self.line_overlap > 0 else []
                current_lines = list(overlap_lines)
                current_char_count = sum(len(l) for l in current_lines)

            current_lines.append(line)
            current_char_count += line_len
            i += 1

        # Emit remaining lines
        if current_lines:
            chunk_text = "".join(current_lines).strip()
            if chunk_text:
                chunks.append(
                    self._create_chunk(
                        document_id, chunk_idx, chunk_text, learner_id, is_public, extra
                    )
                )

        return chunks

    def _create_chunk(
        self,
        document_id: str,
        chunk_idx: int,
        chunk_text: str,
        learner_id: str,
        is_public: bool,
        extra: Dict[str, Any],
    ) -> DocumentChunk:
        byte_size = len(chunk_text.encode("utf-8"))
        chunk_id = f"{document_id}_chunk_{chunk_idx}"
        meta = {
            "document_id": document_id,
            "chunk_index": chunk_idx,
            "learner_id": learner_id,
            "is_public": is_public,
            **extra,
        }
        return DocumentChunk(
            chunk_id=chunk_id,
            document_id=document_id,
            chunk_index=chunk_idx,
            text=chunk_text,
            byte_size=byte_size,
            learner_id=learner_id,
            is_public=is_public,
            metadata=meta,
        )

    def _slice_oversized_line(self, line: str) -> List[str]:
        """Slice a single abnormally large line into chunks under max_chunk_bytes."""
        pieces = []
        step = self.max_chunk_chars
        for start in range(0, len(line), step):
            piece = line[start : start + step].strip()
            if piece:
                pieces.append(piece)
        return pieces
