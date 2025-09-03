from rid_lib.core import RID
from rid_lib.ext.manifest import Manifest
from rid_lib.ext.cache import Cache
from rid_lib.ext.bundle import Bundle


def test_cache_bundle_constructors():
    rid = RID.from_string("test:rid")
    data = {
        "val": "test"
    }
    
    cache_bundle = Bundle(
        manifest=Manifest.generate(rid, data),
        contents=data
    )
    
    cache_bundle_json = cache_bundle.model_dump()
    
    assert cache_bundle == Bundle.model_validate(cache_bundle_json)

def test_cache_functions():
    cache = Cache(".rid_cache")
    rid = RID.from_string("test:rid")
    data = {
        "val": "test"
    }
    
    cache.drop()
    
    assert cache.exists(rid) == False
    
    cache_bundle = Bundle(
        manifest=Manifest.generate(rid, data),
        contents=data
    )
    
    cache.write(cache_bundle)
    
    assert cache_bundle.manifest.rid == rid
    assert cache_bundle.contents == data
    
    assert cache.exists(rid) == True
    
    assert cache.read(rid) == cache_bundle
    
    assert cache.list_rids() == [rid]
    
    cache.delete(rid)
    
    assert cache.read(rid) == None
    
    cache.delete(rid)
    cache.drop()