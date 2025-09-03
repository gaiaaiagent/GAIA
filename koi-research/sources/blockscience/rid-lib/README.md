# RID v3 Protocol

*This specification can be understood as the third iteration of the RID protocol, or RID v3. Previous versions include [RID v1](https://github.com/BlockScience/kms-identity/blob/main/README.md) and [RID v2](https://github.com/BlockScience/rid-lib/blob/v2/README.md).*


### Jump to Sections: 
 - [RID Core](#rid-core)
	- [Introduction](#introduction)
	- [Generic Syntax](#generic-syntax)
	- [Object Reference Names](#object-reference-names-previously-rid-v2)
	- [Implementation](#implementation)
		- [RID class](#rid-class)
		- [RID types](#rid-types)
		- [Creating your own types](#creating-your-own-types)
		- [Pydantic compatibility](#pydantic-compatibility)
	- [Installation](#installation)
	- [Usage](#usage)
	- [Development](#development)
 - [RID Extensions](#rid-extensions)
	- [Introduction](#introduction-1)
	- [Manifest](#manifest)
	- [Event](#manifest)
	- [Cache](#cache)
	- [Effector](#effector)

# RID Core
## Introduction

*Note: throughout this document the terms "resource", "digital object", and "knowledge object" are used roughly interchangeably.*

Reference Identifiers (RIDs) identify references to resources primarily for usage within Knowledge Organization Infrastructure (KOI). The RID specification is informed by previous work on representing digital objects (see [Objects as Reference](https://blog.block.science/objects-as-reference-toward-robust-first-principles-of-digital-organization/)) in which objects are identified through a relationship between a reference and a referent. Under this model, RIDs are the *references*, and the resources they refer to are the *referents.* The *means of reference* describes the relationship between the reference and referent.

```
(reference) -[means of reference]-> (referent)
```

As opposed to Uniform Resource Identifiers (URIs), RIDs are not intended to have universal agreement or a centralized management structure. However, RIDs are compatible with URIs in that *all URIs can be valid RIDs*. [RFC 3986](https://www.rfc-editor.org/info/rfc3986) outlines the basic properties of an URI, adding that "a URI can be further classified as a locator, a name or both." Location and naming can be considered two different means of reference, or methods of linking a reference and referent(s), where:

1. Locators identify resources by *where* they are, with the referent being defined as the resource retrieved via a defined access method. This type of identifier is less stable, and the resource at the specified location could change or become unavailable over time.
3. Names identify resources by *what* they are, acting as a more stable, location independent identifier. Resources identified by name are not always intended to be accessed, but some may be resolvable to locators. While the mapping from name to locator may not be constant the broader relationship between reference and referent should be.
## Generic Syntax

The generic syntax to compose an RID roughly mirrors URIS:
```
<context>:<reference>
```

Conceptually, the reference refers to the referent, while the context provides context for how to interpret the reference, or how to discriminate it from another otherwise identical RID. While in many cases the context simply maps to a URI scheme, the context may also include part of the "hierarchical part" (right hand side of a URI following the scheme).
## Object Reference Names (previously RID v2)

The major change from RID v2 to v3 was building compatibility with URIs, and as a result the previous RID v2 style identifiers are now implemented under the (unofficial) `orn:` URI scheme. 

Object Reference Names (ORNs) identify references to objects, or resources identified independent of their access method. Given the previous definitions of identifiers, ORNs can be considered "names". They are intended to be used with existing resources which may already have well defined identifiers. An ORN identifies a resource by "dislocating" it from a specific access mechanism, maintaining a reference even if the underlying locator changes or breaks. ORNs are generally formed from one or more context specific identifiers which can be easily accessed for processing in other contexts.

ORNs are composed using the following syntax:
```
orn:<namespace>:<reference>
```
*Note: In previous versions, the namespace was split into `<space>.<form>`. Using a dot to separate a namespace in this way is still encouraged, but is not explicitly defined by this specification.*

ORNs also implement a more complex context component: `orn:<namespace>`. The differences between the syntax of ORNs and generic URIs are summarized here:
```
<scheme>:<hierarchical-part>
\______/ \_________________/
    |                |
 context         reference
 ___|_________   ____|____
/             \ /         \
orn:<namespace>:<reference>
```

## Examples

In the current version there are two example implementations of RID types: HTTP/S URLs and Slack objects. The HTTP/S scheme is the most commonly used form of URI and uses the standard RID parsing, where the scheme `http` or `https` is equal to the context, and the hierarchical part is equal to the reference. 

```
scheme  authority                  path
 _|_     ____|___  _________________|___________________
/   \   /        \/                                     \
https://github.com/BlockScience/rid-lib/blob/v3/README.md
\___/ \_________________________________________________/
  |                           |
context                   reference
```

The Slack objects are implemented as ORNs, and include workspaces, channels, messages, and users. The Slack message object's namespace is `slack.message` and its reference component is composed of three internal identifiers, the workspace id, channel id, and message id.

```
scheme namespace     team      channel      timestamp
 |   _____|_____   ___|___    ____|___   _______|_______
/ \ /           \ /       \ /         \ /               \
orn:slack.message:TA2E6KPK3/C07BKQX0EVC/1721669683.087619
\_______________/ \_____________________________________/
        |                            |
     context                     reference
```

By representing Slack messages through ORNs, a stable identifier can be assigned to a resource which can be mapped to existing locators for different use cases. For example, a Slack message can be represented as a shareable link which redirects to the Slack app or in browser app: 
```
https://blockscienceteam.slack.com/archives/C07BKQX0EVC/p1721669683087619
```
There's also a "deep link" which can open the Slack app directly (but only to a channel):
```
slack://open?team=TA2E6KPK3&id=C07BKQX0EVC
```
Finally, there's the backend API call to retrieve the JSON data associated with the message:
```
https://slack.com/api/conversations.replies?channel=C07BKQX0EVC&ts=1721669683.087619&limit=1
```
These three different locators have specific use cases, but none of them work well as long term identifiers of a Slack message. None of them contain all of the identifiers needed to uniquely identify the message (the shareable link comes close, but uses the mutable team name instead of the id). Even if a locator can fully describe an object of interested, it is not resilient to changes in access method and is not designed for portability into systems where the context needs to be clearly stated and internal identifiers easily extracted. Instead, we can represent a Slack message as an ORN and resolve it to any of the above locators when necessary.

## Implementation

### RID class

The RID class provides a template for all RID types and access to a global constructor. All RID instances have access to the following properties:
```python
class RID:
	scheme: str

	# defined for namespaces schemes (ORN, URN, ...) only
	namespace: str | None 

	# "<scheme>:<namespace>" for namespaces schemes, otherwise equal to scheme component
	context: str

	# the component after the context component
	reference: str

	@classmethod
	def from_string(cls, string: str) -> RID: ... 

	# only callable from RID type classes, not the RID base class
	@classmethod
	def from_reference(cls, string: str) -> RID: ...
```



Example implementations can be found in [`src/rid_lib/types/`](https://github.com/BlockScience/rid-lib/tree/main/src/rid_lib/types).

### RID types
This library treats both RIDs and RID types as first class objects. Behind the scenes, the `RIDType` base class is the metaclass for all RID type classes (which are created by inheriting from the `RID`, `ORN`, `URN` classes) -- so RID types are the classes, and RIDs are the instances of those classes. You can access the type of an RID using the built-in type function: `type(rid)`. All RIDs with the same context are guaranteed to share the same RID type class. Even if that RID type doesn't have any explicit class implementation, a class will be automatically generated for it.

```python
class RIDType(ABCMeta):
    scheme: str | None = None
    namespace: str | None = None
    
    # maps RID type strings to their classes
    type_table: dict[str, type["RID"]] = dict() 
    
    @classmethod
    def from_components(mcls, scheme: str, namespace: str | None = None) -> type["RID"]: ...

    @classmethod
    def from_string(mcls, string: str) -> type["RID"]: ...
        
    # backwards compatibility
    @property
    def context(cls) -> str:
        return str(cls)
```

The correct way to check the type of an RID is to check it's Python type. RID types can also be created using `RIDType.from_string`, which is also guaranteed to return the same class if the context component is the same.
```python
from rid_lib import RID, RIDType
from rid_lib.types import SlackMessage

slack_msg_rid = RID.from_string("orn:slack.message:TA2E6KPK3/C07BKQX0EVC/1721669683.087619")

assert type(slack_msg_rid) == SlackMessage
assert SlackMessage == RIDType.from_string("orn:slack.message")
```

### Creating your own types

In order to create an RID type, follow this minimal implementation:
```python
class MyRIDType(RID): # inherit from `RID` or namespace scheme (`ORN`, `URN`, ...) base classes
	# define scheme for a generic URI type
	scheme = "scheme"
	# OR a namespace if using a namespace scheme
	namespace = "namespace"

	# instantiates a new RID from internal components
	def __init__(self, internal_id):
		self.internal_id = internal_id
	
	# returns the reference component
	@property
	def reference(self):
		# should dynamically reflect changes to any internal ids
		return self.internal_id
	
	# instantiates of an RID of this type given a reference
	@classmethod
	def from_reference(cls, reference):
		# in a typical use case, the reference would need to be parsed

		# raise a ValueError if the reference is invalid
		if len(reference) > 10:
			raise ValueError("Internal ID must be less than 10 characters!")
		
		return cls(reference)
```

### Pydantic Compatibility
Both RIDs and RID types are Pydantic compatible fields, which means they can be used directly within a Pydantic model in very flexible ways:

```python
class Model(BaseModel):
	rid: RID
	slack_rid: SlackMessage | SlackUser | SlackChannel | SlackWorkspace
	rid_types: list[RIDType]
```

## Installation

This package can be installed with pip for use in other projects.
```
pip install rid-lib
```

It can also be built and installed from source by cloning this repo and running this command in the root directory.
```
pip install .
```

## Usage

RIDs are intended to be used as a lightweight, cross platform identifiers to facilitate communication between knowledge processing systems. RID objects can be constructed from any RID string using the general constructor `RID.from_string`. The parser will match the string's context component and call the corresponding `from_reference` constructor. This can also be done directly on any RID type class via `MyRIDType.from_reference`. Finally, each context class provides a default constructor which requires each subcomponent to be indvidiually specified.
```python
from rid_lib import RID
from rid_lib.types import SlackMessage

rid_obj1 = RID.from_string("orn:slack.message:TA2E6KPK3/C07BKQX0EVC/1721669683.087619")
rid_obj2 = SlackMessage.from_reference("TA2E6KPK3/C07BKQX0EVC/1721669683.087619")
rid_obj3 = SlackMessage(team_id="TA2E6KPK3", channel_id="C07BKQX0EVC", ts="1721669683.087619")

assert rid_obj1 == rid_obj2 == rid_obj3

# guaranteed to be defined for all RID objects
print(rid_obj1.scheme, rid_obj1.context, rid_obj1.reference)

# special parameters for the slack.message context
print(rid_obj1.team_id, rid_obj1.channel_id, rid_obj1.ts)
```

If an RID type doesn't have a class implementation, it can still be parsed by both the RID and RIDType constructors. A default type implementation will be generated on the fly with a minimal implementation (`reference` property, `from_reference` class method, `__init__` function).

```python
test_obj1 = RID.from_string("test:one")
test_obj2 = RID.from_string("test:one")

assert test_obj1 == test_obj2
assert type(test_obj1) == RIDType.from_string("test")
```

## Development

Build and install from source with development requirements:
```
pip install .[dev]
```
Run unit tests:
```
pytest --cov=rid_lib
```
To build and upload to PyPI:
(Remember to bump the version number in pyproject.toml first!)
```
python -m build
```
Two new build files should appear in `dist/`, a `.tar.gz` and `.whl` file.
```
python -m twine upload -r pypi dist/*
```
Enter the API key and upload the new package version.

# RID Extensions
## Introduction
In addition to the core implementation of the RID specification, this library also provides extended functionality through objects and patterns that interface with RIDs.

## Manifest
A manifest is a portable descriptor of a data object associated with an RID. It is composed of an RID and metadata about the data object it describes (currently a timestamp and sha256 hash). The name "manifest" comes from a shipping metaphor: a piece of cargo has contents (the stuff inside of it) and a manifest (a paper describing the contents and providing tracking info). In the KOI network ecosystem, a manifest serves a similar role. Manifests can be passed around to inform other nodes of a data objects they may be interested in.

Below are the accessible fields and methods of a Manifest object, all are required.

```python
class Manifest(BaseModel):
	rid: RID
	timestamp: datetime
	sha256_hash: str

	# generates a Manifest using the current datetime and the hash of the provided data
	@classmethod
	def generate(cls, rid: RID, data: dict) -> Manifest: ...
```

## Bundle
A bundle is composed of a manifest and contents. This is the "piece of cargo" in the shipping metaphor described above. It's the construct used to transfer and store the RIDed knowledge objects we are interested in.

```python
class Bundle(BaseModel):
    manifest: Manifest
    contents: dict

    @classmethod
    def generate(cls, rid: RID, contents: dict) -> Bundle: ...
```

*Manifests and bundles are implemented as Pydantic models, meaning they can be initialized with args or kwargs. They can also be serialized with `model_dump()` and `model_dump_json()`, and deserialized with `model_validate()` and `model_validate_json()`.*

## Cache
The cache class allows us to set up a cache for reading and writing bundles to the local filesystem. Each bundle is stored as a separate JSON file in the cache directory, where the file name is base 64 encoding of its RID. Below are the accessible fields and methods of a Cache.

```python
class Cache:
    def __init__(self, directory_path: str): ...  

    def file_path_to(self, rid: RID) -> str: ...

    def write(self, cache_bundle: Bundle) -> Bundle: ...

    def exists(self, rid: RID) -> bool: ...
    def read(self, rid: RID) -> Bundle | None: ...
    def list_rids(
		self, rid_types: list[RIDType] | None = None
	) -> list[RID]: ...

    def delete(self, rid: RID) -> None: ...
    def drop(self) -> None: ...
```

## Effector

*The effector has not been used or updated in awhile, it may be removed or refactored in the future.*

The effector is the most abstract construct out of the rid-lib extensions. It acts as an "end effector", performing actions on/with RIDs. More concretely, it allows you to define and bind functions to a specific action type and RID context. The most obvious use case for this is as a dereferencer (and this use case has added functionality): a dereference function can be defined for different types of RIDs, and the effector will automatically choose the correct one to run based on the context of the RID passed in. Below are the accessible fields and methods of Effector.

```python
class Effector:
	cache: Cache | None

	# alias to 'execute', allows actions to be run by calling:
	# effector.run.<action_type>(rid: RID, *args, **kwargs)
	run: ProxyHandler

    def __init__(self, cache: Cache | None = None): ...
    
	# decorator used to register actions to the effector:
	# @effector.register(action_type, rid_type)
    def register(
        self, 
        action_type: ActionType, 
		# rid_type may be singular or multiple strings or RID type classes
        rid_type: Type[RID] | str | tuple[Type[RID] | str]
    ): ...
    
	# decorator used to register dereference actions to the effector
	# (alias to 'register', sets action_type=ActionType.dereference)
    def register_dereference(
		self, 
		rid_type: Type[RID] | str | tuple[Type[RID] | str]
	): ...

	def execute(
		self, 
		action_type: str, 
		rid: RID, 
		*args, 
		**kwargs
	): ...

	# special handler for 'dereference' actions, returns a CacheBundle instead of dict, optionally interacts with cache
	# note: different behavior than calling 'dereference' action with 'execute' or 'run'
    def deref(
        self, 
        rid: RID, 
        hit_cache=True, # tries to read cache first, writes to cache if there is a miss
        refresh=False   # refreshes cache even if there was a hit
    ) -> CacheBundle | None: ...

```

Registering and calling actions with an Effector:

```python
import requests
from rid_lib import RID
from rid_lib.ext import Cache, Effector, ActionType
from rid_lib.types import HTTP, HTTPS

cache = Cache("my_cache")
effector = Effector(cache)

@effector.register_dereference((HTTP, HTTPS))
def dereference_url(url):
	return requests.get(str(url)).json()

my_url = RID.from_string("https://jsonplaceholder.typicode.com/todos/1")

# equivalent actions, returns dict
effector.execute(ActionType.dereference, url)
effector.execute("dereference", url)
effector.run.dereference(url)

# special dereference handler, returns CacheBundle
effector.deref(url)
effector.deref(url, hit_cache=False)
effector.deref(url, refresh=True)
```