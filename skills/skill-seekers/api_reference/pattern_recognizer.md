# API Reference: pattern_recognizer.py

**Language**: Python

**Source**: `src/skill_seekers/cli/pattern_recognizer.py`

---

## Classes

### PatternInstance

Single detected pattern instance

**Inherits from**: (none)

#### Methods

##### to_dict(self) → dict

Export to dictionary

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict`




### PatternReport

Complete pattern detection report

**Inherits from**: (none)

#### Methods

##### to_dict(self) → dict

Export to dictionary

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict`


##### get_summary(self) → dict[str, int]

Get pattern count summary

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, int]`




### BasePatternDetector

Base class for all pattern detectors

**Inherits from**: (none)

#### Methods

##### __init__(self, depth: str = 'deep')

Initialize detector.

Args:
    depth: Detection depth ('surface', 'deep', 'full')

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| depth | str | 'deep' | - |


##### detect_surface(self, _class_sig, _all_classes: list) → PatternInstance | None

Surface-level detection using naming conventions.

Args:
    class_sig: Class signature to analyze
    all_classes: All classes in the file for context

Returns:
    PatternInstance if pattern detected, None otherwise

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _class_sig | None | - | - |
| _all_classes | list | - | - |

**Returns**: `PatternInstance | None`


##### detect_deep(self, _class_sig, _all_classes: list) → PatternInstance | None

Deep detection using structural analysis.

Args:
    class_sig: Class signature to analyze
    all_classes: All classes in the file for context

Returns:
    PatternInstance if pattern detected, None otherwise

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _class_sig | None | - | - |
| _all_classes | list | - | - |

**Returns**: `PatternInstance | None`


##### detect_full(self, _class_sig, _all_classes: list, _file_content: str) → PatternInstance | None

Full detection using behavioral analysis.

Args:
    class_sig: Class signature to analyze
    all_classes: All classes in the file for context
    file_content: Full file content for advanced analysis

Returns:
    PatternInstance if pattern detected, None otherwise

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _class_sig | None | - | - |
| _all_classes | list | - | - |
| _file_content | str | - | - |

**Returns**: `PatternInstance | None`


##### detect(self, class_sig, all_classes: list, file_content: str | None = None) → PatternInstance | None

Detect pattern based on configured depth.

Args:
    class_sig: Class signature to analyze
    all_classes: All classes in the file for context
    file_content: Full file content (needed for 'full' depth)

Returns:
    PatternInstance if pattern detected, None otherwise

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| all_classes | list | - | - |
| file_content | str | None | None | - |

**Returns**: `PatternInstance | None`




### PatternRecognizer

Main pattern recognition orchestrator.

Coordinates multiple pattern detectors to analyze code.

**Inherits from**: (none)

#### Methods

##### __init__(self, depth: str = 'deep', enhance_with_ai: bool = True)

Initialize pattern recognizer.

Args:
    depth: Detection depth ('surface', 'deep', 'full')
    enhance_with_ai: Enable AI enhancement of detected patterns (default: True, C3.6)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| depth | str | 'deep' | - |
| enhance_with_ai | bool | True | - |


##### _register_detectors(self)

Register all available pattern detectors

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### analyze_file(self, file_path: str, content: str, language: str) → PatternReport

Analyze a single file for design patterns.

Args:
    file_path: Path to source file
    content: File content
    language: Programming language

Returns:
    PatternReport with detected patterns

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| file_path | str | - | - |
| content | str | - | - |
| language | str | - | - |

**Returns**: `PatternReport`


##### _convert_to_signatures(self, classes: list[dict])

Convert dict-based class analysis to signature objects.

Note: Returns simple namespace objects that mimic ClassSignature structure
but work with dict-based input from CodeAnalyzer.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| classes | list[dict] | - | - |




### SingletonDetector

Detect Singleton pattern.

Singleton ensures a class has only one instance and provides global access.

Detection Heuristics:
- Surface: Class name contains 'Singleton'
- Deep: Private constructor + static instance method
- Full: Instance caching + thread safety checks

Examples:
- Python: __new__ override with instance caching
- JavaScript: Module pattern or class with getInstance()
- Java: Private constructor + synchronized getInstance()

**Inherits from**: BasePatternDetector

#### Methods

##### __init__(self, depth: str = 'deep')

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| depth | str | 'deep' | - |


##### detect_surface(self, class_sig, _all_classes: list) → PatternInstance | None

Check if class name suggests Singleton

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| _all_classes | list | - | - |

**Returns**: `PatternInstance | None`


##### detect_deep(self, class_sig, all_classes: list) → PatternInstance | None

Check structural characteristics of Singleton

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| all_classes | list | - | - |

**Returns**: `PatternInstance | None`


##### detect_full(self, class_sig, all_classes: list, file_content: str) → PatternInstance | None

Full behavioral analysis for Singleton.

Checks:
- Instance caching in method body
- Thread safety (locks, synchronized)
- Lazy vs eager initialization

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| all_classes | list | - | - |
| file_content | str | - | - |

**Returns**: `PatternInstance | None`




### FactoryDetector

Detect Factory pattern (Factory Method and Abstract Factory).

Factory defines an interface for creating objects, letting subclasses decide
which class to instantiate.

Detection Heuristics:
- Surface: Class/method name contains 'Factory', 'create', 'make'
- Deep: Method returns different object types based on parameters
- Full: Polymorphic object creation with inheritance hierarchy

Examples:
- createProduct(type) -> Product
- ProductFactory with createProductA(), createProductB()

**Inherits from**: BasePatternDetector

#### Methods

##### __init__(self, depth: str = 'deep')

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| depth | str | 'deep' | - |


##### detect_surface(self, class_sig, _all_classes: list) → PatternInstance | None

Check naming conventions for Factory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| _all_classes | list | - | - |

**Returns**: `PatternInstance | None`


##### detect_deep(self, class_sig, all_classes: list) → PatternInstance | None

Structural analysis for Factory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| all_classes | list | - | - |

**Returns**: `PatternInstance | None`




### ObserverDetector

Detect Observer pattern (Pub/Sub).

Observer defines one-to-many dependency where multiple objects
observe and react to state changes.

Detection Heuristics:
- Surface: Class/method names with 'Observer', 'Listener', 'Subscribe'
- Deep: attach/detach + notify methods
- Full: Collection of observers + iteration pattern

Examples:
- addObserver(), removeObserver(), notifyObservers()
- addEventListener(), removeEventListener(), emit()
- subscribe(), unsubscribe(), publish()

**Inherits from**: BasePatternDetector

#### Methods

##### __init__(self, depth: str = 'deep')

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| depth | str | 'deep' | - |


##### detect_surface(self, class_sig, _all_classes: list) → PatternInstance | None

Check naming for Observer pattern

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| _all_classes | list | - | - |

**Returns**: `PatternInstance | None`


##### detect_deep(self, class_sig, all_classes: list) → PatternInstance | None

Structural analysis for Observer

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| all_classes | list | - | - |

**Returns**: `PatternInstance | None`




### StrategyDetector

Detect Strategy pattern.

Strategy defines a family of algorithms, encapsulates each one,
and makes them interchangeable.

Detection Heuristics:
- Surface: Class/method names with 'Strategy', 'Policy', 'Algorithm'
- Deep: Interface with single key method + multiple implementations
- Full: Composition with interchangeable strategy objects

Examples:
- SortStrategy with sort() method
- PaymentStrategy with pay() method
- CompressionStrategy with compress() method

**Inherits from**: BasePatternDetector

#### Methods

##### __init__(self, depth: str = 'deep')

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| depth | str | 'deep' | - |


##### detect_surface(self, class_sig, _all_classes: list) → PatternInstance | None

Check naming for Strategy

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| _all_classes | list | - | - |

**Returns**: `PatternInstance | None`


##### detect_deep(self, class_sig, all_classes: list) → PatternInstance | None

Structural analysis for Strategy

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| all_classes | list | - | - |

**Returns**: `PatternInstance | None`




### DecoratorDetector

Detect Decorator pattern.

Decorator attaches additional responsibilities to an object dynamically,
providing flexible alternative to subclassing.

Detection Heuristics:
- Surface: Class name contains 'Decorator', 'Wrapper'
- Deep: Wraps same interface, delegates to wrapped object
- Full: Composition + delegation + interface matching

Examples:
- LoggingDecorator wraps Service
- CachingDecorator wraps DataFetcher
- Python @decorator syntax

**Inherits from**: BasePatternDetector

#### Methods

##### __init__(self, depth: str = 'deep')

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| depth | str | 'deep' | - |


##### detect_surface(self, class_sig, _all_classes: list) → PatternInstance | None

Check naming for Decorator

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| _all_classes | list | - | - |

**Returns**: `PatternInstance | None`


##### detect_deep(self, class_sig, all_classes: list) → PatternInstance | None

Structural analysis for Decorator

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| all_classes | list | - | - |

**Returns**: `PatternInstance | None`




### BuilderDetector

Detect Builder pattern.

Builder separates construction of complex object from its representation,
allowing same construction process to create different representations.

Detection Heuristics:
- Surface: Class name contains 'Builder'
- Deep: Fluent interface (methods return self), build()/create() terminal method
- Full: Multiple configuration methods + final build step

Examples:
- QueryBuilder with where(), orderBy(), build()
- RequestBuilder with setHeader(), setBody(), execute()
- StringBuilder pattern

**Inherits from**: BasePatternDetector

#### Methods

##### __init__(self, depth: str = 'deep')

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| depth | str | 'deep' | - |


##### detect_surface(self, class_sig, _all_classes: list) → PatternInstance | None

Check naming for Builder

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| _all_classes | list | - | - |

**Returns**: `PatternInstance | None`


##### detect_deep(self, class_sig, all_classes: list) → PatternInstance | None

Structural analysis for Builder

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| all_classes | list | - | - |

**Returns**: `PatternInstance | None`


##### detect_full(self, class_sig, all_classes: list, file_content: str) → PatternInstance | None

Full behavioral analysis for Builder

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| all_classes | list | - | - |
| file_content | str | - | - |

**Returns**: `PatternInstance | None`




### AdapterDetector

Detect Adapter pattern.

Adapter converts interface of a class into another interface clients expect,
allowing incompatible interfaces to work together.

Detection Heuristics:
- Surface: Class name contains 'Adapter', 'Wrapper'
- Deep: Wraps external/incompatible class, translates method calls
- Full: Composition + delegation with interface translation

Examples:
- DatabaseAdapter wraps external DB library
- ApiAdapter translates REST to internal interface
- FileSystemAdapter wraps OS file operations

**Inherits from**: BasePatternDetector

#### Methods

##### __init__(self, depth: str = 'deep')

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| depth | str | 'deep' | - |


##### detect_surface(self, class_sig, _all_classes: list) → PatternInstance | None

Check naming for Adapter

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| _all_classes | list | - | - |

**Returns**: `PatternInstance | None`


##### detect_deep(self, class_sig, all_classes: list) → PatternInstance | None

Structural analysis for Adapter

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| all_classes | list | - | - |

**Returns**: `PatternInstance | None`




### CommandDetector

Detect Command pattern.

Command encapsulates a request as an object, allowing parameterization
of clients with different requests, queuing, logging, and undo operations.

Detection Heuristics:
- Surface: Class name contains 'Command', 'Action', 'Task'
- Deep: Has execute()/run() method, encapsulates action
- Full: Receiver composition + undo support

Examples:
- SaveCommand with execute() method
- UndoableCommand with undo() and redo()
- TaskCommand in task queue

**Inherits from**: BasePatternDetector

#### Methods

##### __init__(self, depth: str = 'deep')

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| depth | str | 'deep' | - |


##### detect_surface(self, class_sig, _all_classes: list) → PatternInstance | None

Check naming for Command

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| _all_classes | list | - | - |

**Returns**: `PatternInstance | None`


##### detect_deep(self, class_sig, all_classes: list) → PatternInstance | None

Structural analysis for Command

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| all_classes | list | - | - |

**Returns**: `PatternInstance | None`




### TemplateMethodDetector

Detect Template Method pattern.

Template Method defines skeleton of algorithm in base class,
letting subclasses override specific steps without changing structure.

Detection Heuristics:
- Surface: Abstract/Base class with template-like names
- Deep: Abstract base with hook methods, concrete subclasses override
- Full: Template method calls abstract/hook methods

Examples:
- AbstractProcessor with process() calling abstract steps
- BaseParser with parse() template method
- Framework base classes with lifecycle hooks

**Inherits from**: BasePatternDetector

#### Methods

##### __init__(self, depth: str = 'deep')

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| depth | str | 'deep' | - |


##### detect_surface(self, class_sig, all_classes: list) → PatternInstance | None

Check naming for Template Method

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| all_classes | list | - | - |

**Returns**: `PatternInstance | None`


##### detect_deep(self, class_sig, all_classes: list) → PatternInstance | None

Structural analysis for Template Method

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| all_classes | list | - | - |

**Returns**: `PatternInstance | None`




### ChainOfResponsibilityDetector

Detect Chain of Responsibility pattern.

Chain of Responsibility passes request along chain of handlers until
one handles it, avoiding coupling sender to receiver.

Detection Heuristics:
- Surface: Class name contains 'Handler', 'Chain', 'Middleware'
- Deep: Has next/successor reference, handle() method
- Full: Chain traversal logic, request passing

Examples:
- LogHandler with next handler
- AuthMiddleware chain
- EventHandler chain

**Inherits from**: BasePatternDetector

#### Methods

##### __init__(self, depth: str = 'deep')

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| depth | str | 'deep' | - |


##### detect_surface(self, class_sig, _all_classes: list) → PatternInstance | None

Check naming for Chain of Responsibility

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| _all_classes | list | - | - |

**Returns**: `PatternInstance | None`


##### detect_deep(self, class_sig, all_classes: list) → PatternInstance | None

Structural analysis for Chain of Responsibility

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | None | - | - |
| all_classes | list | - | - |

**Returns**: `PatternInstance | None`




### LanguageAdapter

Language-specific pattern detection adaptations.

Adjusts pattern confidence based on language idioms and conventions.
Different languages have different ways of implementing patterns.

**Inherits from**: (none)

#### Methods

##### adapt_for_language(pattern: PatternInstance, language: str) → PatternInstance

Adjust confidence based on language-specific idioms.

Args:
    pattern: Detected pattern instance
    language: Programming language

Returns:
    Adjusted pattern instance with language-specific confidence

**Decorators**: `@staticmethod`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| pattern | PatternInstance | - | - |
| language | str | - | - |

**Returns**: `PatternInstance`




## Functions

### main()

CLI entry point for pattern detection.

Usage:
    skill-seekers-patterns --file src/database.py
    skill-seekers-patterns --directory src/ --output patterns/
    skill-seekers-patterns --file app.py --depth full --json

**Returns**: (none)


