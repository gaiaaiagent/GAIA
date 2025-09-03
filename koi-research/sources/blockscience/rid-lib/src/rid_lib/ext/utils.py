import hashlib
from base64 import urlsafe_b64encode, urlsafe_b64decode
from pydantic import BaseModel
from .._vendor.org.webpki.json.Canonicalize import canonicalize


def sha256_hash(data: str) -> str:
    hash = hashlib.sha256()
    hash.update(data.encode())
    return hash.hexdigest()

def sha256_hash_json(data: dict | BaseModel):
    if isinstance(data, BaseModel):
        data = data.model_dump(mode="json")
    canonicalized_data = canonicalize(data, utf8=False)
    return sha256_hash(canonicalized_data)
    
def b64_encode(string: str):
    return urlsafe_b64encode(
        string.encode()).decode().rstrip("=")

def b64_decode(string: str):
    return urlsafe_b64decode(
        (string + "=" * (-len(string) % 4)).encode()).decode()