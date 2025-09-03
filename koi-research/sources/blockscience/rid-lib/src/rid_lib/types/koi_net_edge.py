import json
import hashlib
from rid_lib.core import ORN
from .koi_net_node import KoiNetNode


class KoiNetEdge(ORN):
    namespace = "koi-net.edge"
    
    def __init__(self, id):
        self.id = id
        
    @property
    def reference(self):
        return self.id
    
    @classmethod
    def from_reference(cls, reference):
        return cls(reference)