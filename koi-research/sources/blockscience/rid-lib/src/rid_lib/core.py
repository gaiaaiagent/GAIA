from typing import Any
from abc import ABCMeta, abstractmethod
from pydantic_core import core_schema, CoreSchema
from pydantic import GetCoreSchemaHandler, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from . import utils
from .consts import (
    ABSTRACT_TYPES, 
    NAMESPACE_SCHEMES, 
    ORN_SCHEME, 
    URN_SCHEME
)


class RIDType(ABCMeta):
    scheme: str | None = None
    namespace: str | None = None
    
    # maps RID type strings to their classes
    type_table: dict[str, type["RID"]] = dict() 
    
    def __new__(mcls, name, bases, dct):
        """Runs when RID derived classes are defined."""
            
        cls = super().__new__(mcls, name, bases, dct)
        
        # ignores built in RID types which aren't directly instantiated
        if name in ABSTRACT_TYPES:
            return cls
            
        if not getattr(cls, "scheme", None):
            raise TypeError(f"RID type '{name}' is missing 'scheme' definition")
        
        if not isinstance(cls.scheme, str):
            raise TypeError(f"RID type '{name}' 'scheme' must be of type 'str'")
        
        if cls.scheme in NAMESPACE_SCHEMES:
            if not getattr(cls, "namespace", None): 
                raise TypeError(f"RID type '{name}' is using namespace scheme but missing 'namespace' definition")
            if not isinstance(cls.namespace, str):
                raise TypeError(f"RID type '{name}' is using namespace scheme but 'namespace' is not of type 'str'")
                
        # check for abstract method implementation
        if getattr(cls, "__abstractmethods__", None):
            raise TypeError(f"RID type '{name}' is missing implementation(s) for abstract method(s) {set(cls.__abstractmethods__)}")
        
        # save RID type to lookup table
        mcls.type_table[str(cls)] = cls
        return cls
    
    @classmethod
    def _new_default_type(mcls, scheme: str, namespace: str | None) -> type["RID"]:
        """Returns a new RID type deriving from DefaultType."""      
        if namespace:
            name = "".join([s.capitalize() for s in namespace.split(".")])
        else:
            name = scheme.capitalize()
        
        bases = (DefaultType,)
        
        if scheme in NAMESPACE_SCHEMES:
            if scheme == ORN_SCHEME:
                bases += (ORN,)
            elif scheme == URN_SCHEME:
                bases += (URN,)
        
        dct = dict(
            scheme=scheme, 
            namespace=namespace
        )
        
        return type(name, bases, dct)
    
    @classmethod
    def from_components(mcls, scheme: str, namespace: str | None = None) -> type["RID"]:
        context = utils.make_context_string(scheme, namespace)
        
        if context in mcls.type_table:
            return mcls.type_table[context]
        else:
            return mcls._new_default_type(scheme, namespace)
    
    @classmethod
    def from_string(mcls, string: str) -> type["RID"]:
        """Returns an RID type class from an RID context string."""
        
        scheme, namespace, _ = utils.parse_rid_string(string, context_only=True)
        return mcls.from_components(scheme, namespace)
     
    def __str__(cls) -> str:
        if cls.__name__ in ABSTRACT_TYPES: 
            return repr(cls)
        return utils.make_context_string(cls.scheme, cls.namespace)
    
    def __repr__(cls) -> str:
        if cls.__name__ in ABSTRACT_TYPES: 
            return type.__repr__(cls)
        return f"<RIDType '{str(cls)}'>"
    
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source: type[Any], handler: GetCoreSchemaHandler
    ) -> CoreSchema:
                
        def not_abstract_type(rid_type: RIDType) -> RIDType:
            if rid_type.__name__ in ABSTRACT_TYPES:
                raise ValueError(f"RIDType must not be abstract type: {ABSTRACT_TYPES}")
            return rid_type
        
        # must be instance of RIDType not in ABSTRACT_TYPES
        from_instance_schema = core_schema.chain_schema([
            core_schema.is_instance_schema(RIDType),
            core_schema.no_info_plain_validator_function(not_abstract_type)
        ])
        
        # must be valid string, validated by RIDType.from_string (and prev schema)
        from_str_schema = core_schema.chain_schema([
            core_schema.str_schema(),
            core_schema.no_info_plain_validator_function(RIDType.from_string),
            from_instance_schema
        ])
        
        return core_schema.json_or_python_schema(
            json_schema=from_str_schema,
            python_schema=core_schema.union_schema([
                from_instance_schema,
                from_str_schema
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(str)
        )
        
    @classmethod
    def __get_pydantic_json_schema__(
        cls, _core_schema: CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        json_schema = handler(core_schema.str_schema())
        json_schema.update({"format": "rid-type"})
        return json_schema
        
    # backwards compatibility
    @property
    def context(cls) -> str:
        return str(cls)
        

class RID(metaclass=RIDType):
    scheme: str | None = None
    namespace: str | None = None
    
    @property
    def context(self):
        return str(type(self))
    
    def __str__(self) -> str:
        return self.context + ":" + self.reference
    
    def __repr__(self) -> str:
        return f"<RID '{str(self)}'>"
    
    def __eq__(self, other) -> bool:
        if isinstance(other, self.__class__):
            return str(self) == str(other)
        else:
            return False
    
    def __hash__(self):
        return hash(str(self))
    
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source: type[Any], handler: GetCoreSchemaHandler
    ) -> CoreSchema:
        
        # must be valid string, validated by RID.from_string, and an instance of the correct RID type
        from_str_schema = core_schema.chain_schema([
            core_schema.str_schema(),
            core_schema.no_info_plain_validator_function(RID.from_string),
            core_schema.is_instance_schema(cls)
        ])
        
        return core_schema.json_or_python_schema(
            json_schema=from_str_schema,
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(cls),
                from_str_schema
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(str)
        )
    
    @classmethod
    def __get_pydantic_json_schema__(
        cls, _core_schema: CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        json_schema = handler(core_schema.str_schema())
        json_schema.update({"format": "rid"})
        return json_schema
    
    @classmethod
    def from_string(cls, string: str) -> "RID":
        scheme, namespace, reference = utils.parse_rid_string(string)
        return RIDType.from_components(scheme, namespace).from_reference(reference)
    
    @abstractmethod
    def __init__(self, *args, **kwargs):
        ...
    
    @classmethod
    @abstractmethod
    def from_reference(cls, reference: str):
        ...
    
    @property
    @abstractmethod
    def reference(self) -> str:
        ...


class ORN(RID):
    scheme = ORN_SCHEME
    
class URN(RID):
    scheme = URN_SCHEME
    
class DefaultType(RID):
    def __init__(self, _reference):
        self._reference = _reference
        
    @classmethod
    def from_reference(cls, reference):
        return cls(reference)
    
    @property
    def reference(self):
        return self._reference