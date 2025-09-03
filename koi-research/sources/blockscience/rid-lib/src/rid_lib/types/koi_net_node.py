from rid_lib.core import ORN


class KoiNetNode(ORN):
    namespace = "koi-net.node"
    
    def __init__(self, name: str, hash: str):
        self.name: str = name
        self.hash: str = hash
        
    @property
    def reference(self):
        return f"{self.name}+{self.hash}"
    
    @classmethod
    def from_reference(cls, reference):
        components = reference.split("+")
        if len(components) == 2:
            return cls(*components)
        else:
            raise ValueError("KOI-net Node reference must contain two '+'-separated components: '<name>+<hash>'")