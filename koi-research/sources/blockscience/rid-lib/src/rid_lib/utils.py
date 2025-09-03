from .consts import NAMESPACE_SCHEMES


def make_context_string(scheme: str, namespace: str | None):
    if scheme in NAMESPACE_SCHEMES:
        if namespace is None:
            raise TypeError("Cannot create context for namespace scheme '{scheme}' when namespace is None")
        return scheme + ":" + namespace
    else:
        if namespace is not None:
            raise TypeError("Cannot create context for non-namespace scheme '{scheme}' when namespace is not None")
        return scheme

def parse_rid_string(
    string: str, 
    context_only: bool = False
) -> tuple[str, str | None, str | None]:
    """Parses RID (or context) string into scheme, namespace, and reference components."""
    
    scheme = None
    namespace = None
    reference = None
    
    if not isinstance(string, str):
        raise TypeError(f"RID type string '{string}' must be of type 'str'")
    
    i = string.find(":")
    
    if i < 0:
        if not context_only:
            raise TypeError(f"RID string '{string}' should contain a ':'-separated context and reference componeont")
        
        scheme = string
        namespace = None
        
        if scheme in NAMESPACE_SCHEMES:
            raise TypeError(f"RID type string '{string}' is a namespace scheme but is missing a namespace component")
        
    else:        
        scheme = string[:i]
        if scheme in NAMESPACE_SCHEMES:
            j = string.find(":", i+1)
        
            if j < 0:
                if context_only:
                    namespace = string[i+1:]
                else:
                    raise TypeError(f"RID string '{string}' is missing a reference component")
            else:
                if context_only:
                    raise TypeError(f"RID type string '{string}' should contain a maximum of two ':'-separated components")
                else:
                    namespace = string[i+1:j]
                    reference = string[j+1:]
        else:
            if context_only:
                raise TypeError(f"RID type string '{string}' contains a ':'-separated namespace component, but scheme doesn't support namespaces")
            else:
                reference = string[i+1:]
    
    if scheme == "":
        raise TypeError(f"RID type string '{string}' cannot have an empty scheme")
    
    if namespace == "":
        raise TypeError(f"RID type string '{string}' cannot have an empty namespace")
    
    if reference == "":
        raise TypeError(f"RID string '{string}' cannot have an empty reference")
    
    return scheme, namespace, reference