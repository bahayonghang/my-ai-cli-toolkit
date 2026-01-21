# API Reference: test_swift_detection.py

**Language**: Python

**Source**: `tests/test_swift_detection.py`

---

## Classes

### TestSwiftCSSClassDetection

Test Swift detection from CSS classes

**Inherits from**: (none)

#### Methods

##### test_language_swift_class(self)

Test language-swift CSS class

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_lang_swift_class(self)

Test lang-swift CSS class

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_bare_swift_class(self)

Test bare 'swift' class name

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_detect_from_html_swift_class(self)

Test HTML element with Swift CSS class

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestPureSwiftDetection

Test pure Swift syntax detection

**Inherits from**: (none)

#### Methods

##### test_func_with_return_type(self)

Test Swift function with return type

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_struct_declaration(self)

Test Swift struct declaration

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_protocol_declaration(self)

Test Swift protocol declaration

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_extension_declaration(self)

Test Swift extension

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_guard_let_unwrapping(self)

Test Swift guard let optional unwrapping

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_if_let_unwrapping(self)

Test Swift if let optional unwrapping

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_closure_syntax(self)

Test Swift closure syntax

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_error_handling(self)

Test Swift error handling (try/catch/throws)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_async_await(self)

Test Swift async/await (Swift 5.5+)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_actor_declaration(self)

Test Swift actor (Swift 5.5+)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_generics_with_constraints(self)

Test Swift generics with constraints

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enum_with_associated_values(self)

Test Swift enum with associated values

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_opaque_types(self)

Test Swift opaque types (some keyword)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_property_observers(self)

Test Swift property observers (willSet/didSet)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_memory_management_weak(self)

Test Swift memory management (weak var)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_memory_management_weak_self_in_closure(self)

Test Swift weak self in closures

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_memory_management_unowned(self)

Test Swift unowned keyword

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_string_interpolation(self)

Test Swift string interpolation

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestUIKitDetection

Test iOS/UIKit pattern detection

**Inherits from**: (none)

#### Methods

##### test_viewcontroller_lifecycle(self)

Test UIViewController lifecycle methods

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_iboutlet_ibaction(self)

Test @IBOutlet and @IBAction

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_tableview_delegate(self)

Test UITableView delegate/datasource

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_auto_layout_constraints(self)

Test Auto Layout constraint code

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_dispatch_queue(self)

Test DispatchQueue usage

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_codable_json(self)

Test Codable JSON encoding/decoding

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestAppKitDetection

Test macOS/AppKit pattern detection

**Inherits from**: (none)

#### Methods

##### test_nsviewcontroller_lifecycle(self)

Test NSViewController lifecycle methods

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_nswindow_controller(self)

Test NSWindowController

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_nstableview_delegate(self)

Test NSTableView delegate/datasource

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_nsapplication_delegate(self)

Test NSApplicationDelegate

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_nsmenu_toolbar(self)

Test NSMenu and NSToolbar

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_nspanel_dialogs(self)

Test NSOpenPanel and NSSavePanel

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_nsstatusbar_menubar_extra(self)

Test NSStatusBar for menu bar apps

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestSwiftUIDetection

Test SwiftUI pattern detection

**Inherits from**: (none)

#### Methods

##### test_basic_swiftui_view(self)

Test basic SwiftUI View

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_state_binding(self)

Test @State and @Binding

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_observable_object(self)

Test @Published and @ObservedObject

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_environment_object(self)

Test @EnvironmentObject and @Environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swiftui_stacks(self)

Test VStack, HStack, ZStack

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swiftui_navigation(self)

Test NavigationView/NavigationStack and NavigationLink

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swiftui_modifiers(self)

Test SwiftUI view modifiers

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swiftui_list_foreach(self)

Test List and ForEach

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swiftui_sheet_alert(self)

Test .sheet and .alert modifiers

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swiftui_macos_window_group(self)

Test macOS SwiftUI WindowGroup and Scene

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swiftui_navigation_split_view(self)

Test NavigationSplitView (macOS/iPad)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swift_observation(self)

Test Swift 5.9 @Observable macro

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestCombineDetection

Test Combine framework patterns

**Inherits from**: (none)

#### Methods

##### test_combine_publisher_subscriber(self)

Test Combine Publisher and Subscriber

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_combine_subjects(self)

Test PassthroughSubject and CurrentValueSubject

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestSwiftConfidenceScoring

Test confidence scoring accuracy

**Inherits from**: (none)

#### Methods

##### test_minimal_swift_code(self)

Test minimal Swift code (edge case)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_high_confidence_full_app(self)

Test complete SwiftUI app (high confidence expected)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swift_vs_similar_languages(self)

Test Swift doesn't false-positive for similar syntax in other languages.

Critical for avoiding misclassification of:
- Go: 'func', ':=' short declaration
- Rust: 'fn', 'let mut', struct
- TypeScript: 'let', 'const', type annotations with ':'

These languages share keywords or syntax patterns with Swift,
so detection must use unique Swift patterns (guard let, @State, etc.)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestSwiftEdgeCases

Test edge cases and error handling

**Inherits from**: (none)

#### Methods

##### test_swift_snippet_short(self)

Test short Swift snippet

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swift_import_swiftui_only(self)

Test SwiftUI import statement alone

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swift_import_uikit_only(self)

Test UIKit import statement alone

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swift_import_appkit_only(self)

Test AppKit import statement alone

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swift_with_comments(self)

Test Swift code with comments

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swift_core_data(self)

Test Core Data code

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swift_data(self)

Test SwiftData code (iOS 17+)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestFoundationModelsDetection

Test Foundation Models framework detection (iOS/macOS 26+)

**Inherits from**: (none)

#### Methods

##### test_foundation_models_import(self)

Test FoundationModels import

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_generable_macro(self)

Test @Generable macro detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_language_model_session(self)

Test LanguageModelSession usage

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_system_language_model(self)

Test SystemLanguageModel usage

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_streaming_response(self)

Test streaming response pattern

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_guided_generation(self)

Test guided generation with GeneratedContent

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestSwiftErrorHandling

Test error handling and graceful degradation for Swift detection

**Inherits from**: (none)

#### Methods

##### test_pattern_validation_catches_invalid_weight(self)

Test that pattern validation catches invalid weight values

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_pattern_validation_catches_invalid_type(self)

Test that pattern validation catches non-string patterns

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_pattern_validation_catches_invalid_tuple_structure(self)

Test that pattern validation catches malformed tuples

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_malformed_regex_patterns_are_skipped(self)

Test that invalid regex patterns are logged and skipped without crashing

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_empty_swift_patterns_handled_gracefully(self)

Test that empty SWIFT_PATTERNS dict doesn't crash detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_non_string_pattern_handled_during_compilation(self)

Test that non-string patterns are caught during compilation

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_swift_validation_error_disables_detection(self)

Test that validation error handling code exists in swift_patterns.py

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



