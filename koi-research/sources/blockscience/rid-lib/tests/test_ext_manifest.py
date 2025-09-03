from datetime import datetime, timezone
from rid_lib.core import RID
from rid_lib.ext import Manifest, utils


def test_manifest_constructors():
    rid = RID.from_string("test:rid")
    
    manifest = Manifest(
        rid=rid,
        timestamp=datetime.now(timezone.utc),
        sha256_hash=utils.sha256_hash_json({})
    )
    
    manifest_json = manifest.model_dump()
    
    assert manifest == Manifest.model_validate(manifest_json)

def test_manifest_generate():
    rid = RID.from_string("test:rid")
    data = {
        "val": "test"
    }
    
    manifest = Manifest.generate(rid, data)
    
    assert manifest == Manifest(
        rid=rid,
        timestamp=manifest.timestamp,
        sha256_hash=utils.sha256_hash_json(data)
    )