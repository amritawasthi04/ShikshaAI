"""Export database clients, managers, repositories, worker, reliability, and operations."""
from app.db.chroma_client import ChromaManager, chroma_manager
from app.db.chunking import DocumentChunk, LineChunker
from app.db.connection import MongoManager, get_chat_db, get_core_db, mongo_manager
from app.db.coordinator import CrossStoreCoordinator
from app.db.indexes import IndexManager
from app.db.manager import DatabaseManager
from app.db.operations import DatabaseOperations
from app.db.reliability import JobManager, OutboxProcessor
from app.db.repositories import (
    AssessmentRepository,
    BaseMongoRepository,
    ChatRepository,
    ChromaVectorRepository,
    DocumentRepository,
    ExecutionRepository,
    LearnerRepository,
    LessonRepository,
    ProjectRepository,
    ProposalRepository,
    SkillRepository,
    StudyPlanRepository,
)
from app.db.transaction import commit_with_outbox, mongo_transaction
from app.db.worker import DatabaseWorker, DatabaseWorkerPermissionError

__all__ = [
    "mongo_manager",
    "chroma_manager",
    "MongoManager",
    "ChromaManager",
    "get_core_db",
    "get_chat_db",
    "DatabaseManager",
    "DatabaseWorker",
    "DatabaseWorkerPermissionError",
    "JobManager",
    "OutboxProcessor",
    "DatabaseOperations",
    "IndexManager",
    "CrossStoreCoordinator",
    "LineChunker",
    "DocumentChunk",
    "mongo_transaction",
    "commit_with_outbox",
    "BaseMongoRepository",
    "LearnerRepository",
    "SkillRepository",
    "RoadmapRepository",
    "LessonRepository",
    "AssessmentRepository",
    "ProjectRepository",
    "DocumentRepository",
    "StudyPlanRepository",
    "ProposalRepository",
    "ExecutionRepository",
    "ChatRepository",
    "ChromaVectorRepository",
]
