from typing import TypeVar
from pydantic import BaseModel
from rid_lib.core import RID
from .manifest import Manifest


T = TypeVar("T", bound=BaseModel)

class Bundle(BaseModel):
    """A knowledge bundle composed of a manifest and contents associated with an RIDed object.

    Acts as a container for the data associated with an RID. It is written to and read from the cache.
    """
    manifest: Manifest
    contents: dict
    
    @classmethod
    def generate(cls, rid: RID, contents: dict) -> "Bundle":
        """Generates a bundle from provided RID and contents."""
        return cls(
            manifest=Manifest.generate(rid, contents),
            contents=contents
        )
    
    @property
    def rid(self):
        """This bundle's RID."""
        return self.manifest.rid
    
    def validate_contents(self, model: type[T]) -> T:
        """Attempts to validate contents against a Pydantic model."""
        return model.model_validate(self.contents)