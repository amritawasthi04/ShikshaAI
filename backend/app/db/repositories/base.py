"""Generic typed asynchronous repository for MongoDB operations."""
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar
from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase
from pydantic import BaseModel
from app.db.models.base import utc_now

T = TypeVar("T", bound=BaseModel)


class BaseMongoRepository(Generic[T]):
    """Base repository providing standardized async CRUD operations."""

    def __init__(self, db: AsyncIOMotorDatabase, collection_name: str, model_cls: Type[T]) -> None:
        self.db = db
        self.collection_name = collection_name
        self.model_cls = model_cls

    @property
    def collection(self) -> AsyncIOMotorCollection:
        return self.db[self.collection_name]

    async def insert(self, entity: T) -> T:
        """Insert a single document."""
        doc = entity.model_dump(by_alias=True)
        if "created_at" not in doc:
            doc["created_at"] = utc_now()
        if "updated_at" not in doc:
            doc["updated_at"] = utc_now()
        await self.collection.insert_one(doc)
        return entity

    async def insert_many(self, entities: List[T]) -> List[T]:
        """Insert multiple documents in bulk."""
        if not entities:
            return []
        docs = []
        for e in entities:
            d = e.model_dump(by_alias=True)
            if "created_at" not in d:
                d["created_at"] = utc_now()
            if "updated_at" not in d:
                d["updated_at"] = utc_now()
            docs.append(d)
        await self.collection.insert_many(docs)
        return entities

    async def find_one(self, query: Dict[str, Any]) -> Optional[T]:
        """Find a single document matching query filter."""
        doc = await self.collection.find_one(query, {"_id": 0})
        if not doc:
            return None
        return self.model_cls.model_validate(doc)

    async def find_many(
        self,
        query: Dict[str, Any],
        sort: Optional[List[tuple]] = None,
        limit: int = 50,
        skip: int = 0,
    ) -> List[T]:
        """Find multiple documents with sorting, limit, and pagination."""
        cursor = self.collection.find(query, {"_id": 0})
        if sort:
            cursor = cursor.sort(sort)
        if skip > 0:
            cursor = cursor.skip(skip)
        if limit > 0:
            cursor = cursor.limit(limit)

        docs = await cursor.to_list(length=limit)
        return [self.model_cls.model_validate(d) for d in docs]

    async def update_one(
        self,
        query: Dict[str, Any],
        update_fields: Dict[str, Any],
        upsert: bool = False,
    ) -> bool:
        """Update fields on a single document matching query."""
        if any(k.startswith("$") for k in update_fields):
            update_doc = dict(update_fields)
            if "$set" in update_doc:
                update_doc["$set"]["updated_at"] = utc_now()
            else:
                update_doc["$set"] = {"updated_at": utc_now()}
        else:
            fields = dict(update_fields)
            fields["updated_at"] = utc_now()
            update_doc = {"$set": fields}
        res = await self.collection.update_one(query, update_doc, upsert=upsert)
        return res.modified_count > 0 or res.upserted_id is not None

    async def delete_one(self, query: Dict[str, Any]) -> bool:
        """Delete a single document."""
        res = await self.collection.delete_one(query)
        return res.deleted_count > 0

    async def delete_many(self, query: Dict[str, Any]) -> int:
        """Delete all documents matching query."""
        res = await self.collection.delete_many(query)
        return res.deleted_count

    async def count(self, query: Optional[Dict[str, Any]] = None) -> int:
        """Count total documents matching query."""
        return await self.collection.count_documents(query or {})

    async def exists(self, query: Dict[str, Any]) -> bool:
        """Check if at least one document exists matching query."""
        doc = await self.collection.find_one(query, {"_id": 1})
        return doc is not None
