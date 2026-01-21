# API Reference: test_pattern_recognizer.py

**Language**: Python

**Source**: `tests/test_pattern_recognizer.py`

---

## Classes

### TestSingletonDetector

Tests for Singleton pattern detection

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_surface_detection_by_name(self)

Test surface detection using class name

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_deep_detection_with_instance_method(self)

Test deep detection with getInstance() method

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_python_singleton_with_new(self)

Test Python-specific __new__ singleton pattern

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_java_singleton_pattern(self)

Test Java-style Singleton pattern

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestFactoryDetector

Tests for Factory pattern detection

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_surface_detection_by_name(self)

Test surface detection using class name

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_factory_method_detection(self)

Test detection of create/make methods

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_abstract_factory_multiple_methods(self)

Test Abstract Factory with multiple creation methods

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_parameterized_factory(self)

Test parameterized factory pattern

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestObserverDetector

Tests for Observer pattern detection

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_observer_triplet_detection(self)

Test classic attach/detach/notify triplet

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_pubsub_pattern(self)

Test publish/subscribe variant

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_event_emitter_pattern(self)

Test EventEmitter-style observer

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestPatternRecognizerIntegration

Integration tests for PatternRecognizer

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_analyze_singleton_code(self)

Test end-to-end Singleton analysis

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_analyze_factory_code(self)

Test end-to-end Factory analysis

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_analyze_observer_code(self)

Test end-to-end Observer analysis

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_pattern_report_summary(self)

Test PatternReport.get_summary() method

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestMultiLanguageSupport

Tests for multi-language pattern detection

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_python_patterns(self)

Test Python-specific patterns

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_javascript_patterns(self)

Test JavaScript-specific patterns

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_java_patterns(self)

Test Java-specific patterns

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestExtendedPatternDetectors

Tests for extended pattern detectors (Builder, Adapter, Command, etc.)

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_builder_pattern(self)

Test Builder pattern detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_adapter_pattern(self)

Test Adapter pattern detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_command_pattern(self)

Test Command pattern detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestLanguageAdapter

Tests for language-specific adaptations

**Inherits from**: unittest.TestCase

#### Methods

##### test_python_decorator_boost(self)

Test Python @decorator syntax boost

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_javascript_module_pattern(self)

Test JavaScript module pattern boost

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_no_pattern_returns_none(self)

Test None input returns None

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



