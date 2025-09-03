from datetime import datetime, timezone
from pydantic import BaseModel
from rid_lib.core import RID
from .utils import sha256_hash_json


class Manifest(BaseModel):
    """A portable descriptor of a data object associated with an RID.
    
    Composed of an RID, timestamp, and sha256 hash of the data object.
    """
    rid: RID
    timestamp: datetime
    sha256_hash: str
    
    @classmethod
    def generate(cls, rid: RID, data: dict) -> "Manifest":
        """Generates a Manifest using the current time and hashing the provided data."""
        return cls(
            rid=rid,
            timestamp=datetime.now(timezone.utc),
            sha256_hash=sha256_hash_json(data)
        )