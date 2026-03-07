"""MongoDB async connection via Motor."""

import os
from motor.motor_asyncio import AsyncIOMotorClient

_client: AsyncIOMotorClient | None = None
_db = None


async def connect_db():
    global _client, _db
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    _client = AsyncIOMotorClient(uri)
    # Use the default DB from the URI or fall back to "test"
    _db = _client.get_default_database(default="test")
    # Quick connectivity check
    await _client.admin.command("ping")


async def close_db():
    global _client
    if _client:
        _client.close()


def get_db():
    """Return the Motor database handle."""
    return _db
