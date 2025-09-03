from urllib.parse import urlsplit, urlunsplit

from rid_lib.core import RID
        
class HTTP(RID):
    scheme = "http"
    
    def __init__(self, authority, path, query, fragment):
        self.authority = authority
        self.path = path
        self.query = query
        self.fragment = fragment
        
    @property
    def reference(self):
        return urlunsplit((
            "",
            self.authority,
            self.path,
            self.query,
            self.fragment
        ))
        
    @classmethod
    def from_reference(cls, reference):
        uri_components = urlsplit(reference, scheme=cls.scheme)
        # excluding scheme component
        return cls(*uri_components[1:])

class HTTPS(HTTP):
    scheme = "https"