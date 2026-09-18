from __future__ import annotations

from sqlalchemy import select

from ..models import ModelRegistryEntry
from .base import Repository


class ModelRegistryRepository(Repository[ModelRegistryEntry]):
    model = ModelRegistryEntry

    def get_by_name_version(self, name: str, version: str) -> ModelRegistryEntry | None:
        return self.db.scalar(select(ModelRegistryEntry)
                              .where(ModelRegistryEntry.name == name, ModelRegistryEntry.version == version))

    def upsert(self, **fields) -> ModelRegistryEntry:
        obj = self.get_by_name_version(fields["name"], fields["version"])
        if obj is None:
            obj = ModelRegistryEntry(**fields)
            self.db.add(obj)
        else:
            for k, v in fields.items():
                setattr(obj, k, v)
        self.db.flush()
        return obj
