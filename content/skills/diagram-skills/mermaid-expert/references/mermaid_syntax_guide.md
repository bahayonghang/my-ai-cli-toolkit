# Mermaid Syntax Reference

Focused syntax reference for generating Mermaid diagrams. Covers all 7 diagram types with concise examples.

## Flowcharts

**Directions:** `TD`/`TB` (top-down), `BT`, `LR`, `RL`

**Node shapes:**
```mermaid
flowchart LR
    A[Rectangle] --> B(Rounded)
    B --> C{Diamond}
    C --> D((Circle))
    D --> E>Flag]
    E --> F[/Parallelogram/]
```

**Link types:**
```
A --> B        %% Arrow
A --- B        %% Line (no arrow)
A -.-> B       %% Dotted arrow
A ==> B        %% Thick arrow
A -->|label| B %% Arrow with text
A -- text --- B %% Line with text
```

**Subgraphs:**
```mermaid
flowchart TB
    subgraph "Authentication"
        A[Login] --> B{Valid?}
        B -->|Yes| C[Grant]
        B -->|No| D[Deny]
    end

    subgraph "Application"
        C --> E[Dashboard]
        E --> F[Actions]
    end
```

**Styling:**
```mermaid
flowchart TD
    A[Start] --> B[End]
    style A fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style B fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
```

**Class-based styles:**
```mermaid
flowchart TD
    A:::success --> B:::error
    classDef success fill:#e8f5e8,stroke:#2e7d32
    classDef error fill:#ffebee,stroke:#c62828
```

## Sequence Diagrams

**Message types:**
```
A->>B    %% Solid arrow (synchronous)
A-->>B   %% Dashed arrow (response/async)
A-xB     %% Solid with X (lost message)
A--xB    %% Dashed with X
```

**Full example:**
```mermaid
sequenceDiagram
    participant User as UI User
    participant API as API Server
    participant DB as Database

    User->>API: POST /data
    activate API
    API->>DB: Query
    DB-->>API: Results
    deactivate API
    API-->>User: JSON response

    Note over User,DB: Complete workflow
```

**Loops and conditionals:**
```mermaid
sequenceDiagram
    participant Client
    participant Server

    loop Retry mechanism
        Client->>Server: Request
        alt Success
            Server-->>Client: 200 OK
        else Error
            Server--xClient: 500 Error
            Client->>Client: Wait and retry
        end
    end
```

## Class Diagrams

**Class definition:**
```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
        +eat()
    }

    class Dog {
        +String breed
        +bark()
    }

    Animal <|-- Dog : inherits
```

**Relationship types:**
```
A <|-- B    %% Inheritance
A *-- B     %% Composition
A o-- B     %% Aggregation
A --> B     %% Association
A ..> B     %% Dependency
A ..|> B    %% Realization
```

**Cardinality:**
```mermaid
classDiagram
    User "1" --> "*" Order : places
    Order "*" --> "*" Product : contains
```

## State Diagrams

**Basic states:**
```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : start
    Processing --> Done : complete
    Processing --> Failed : error
    Done --> [*]
    Failed --> [*]
```

**Nested states:**
```mermaid
stateDiagram-v2
    [*] --> Active

    state Active {
        [*] --> Reading
        Reading --> Writing : edit
        Writing --> Reading : save
    }

    Active --> [*] : logout
```

## Gantt Charts

```mermaid
gantt
    title Project Plan
    dateFormat  YYYY-MM-DD
    section Design
    Wireframes     :done, a1, 2024-01-01, 5d
    Mockups        :a2, after a1, 7d
    section Dev
    Frontend       :a3, after a2, 14d
    Backend        :a4, after a1, 21d
    section Test
    QA             :a5, after a3, 10d
    section Deploy
    Launch         :milestone, m1, after a5, 0d
```

**Task modifiers:** `done`, `active`, `crit`, `milestone`

## Git Graphs

```mermaid
gitGraph
    commit id: "init"
    branch develop
    checkout develop
    commit id: "setup"
    branch feature
    checkout feature
    commit id: "add auth"
    commit id: "add tests"
    checkout develop
    merge feature tag: "v0.1.0"
    checkout main
    merge develop tag: "v1.0.0"
```

## Block Diagrams

```mermaid
block-beta
    columns 3

    block:Frontend["Frontend"]
        Web[Web App]
        Mobile[Mobile]
    end

    block:Backend["Backend"]
        API[API Server]
        Auth[Auth Service]
    end

    block:Data["Data Layer"]
        db[(Database)]
        cache[(Cache)]
    end

    Frontend --> Backend
    Backend --> Data
```

## Themes

**Via init directive:**
```mermaid
%%{init: {'theme': 'forest'}}%%
flowchart TD
    A --> B
```

Built-in themes: `default`, `neutral`, `dark`, `forest`, `base`

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Diagram not rendering | Check language identifier is `mermaid`; verify no tab characters (use spaces) |
| Syntax error on special chars | Wrap labels in quotes: `A["Label with (parens)"]` |
| Node ID conflicts | Use unique IDs; avoid reserved words (`end`, `graph`, `subgraph`) |
| Subgraph links fail | Link to nodes inside subgraphs, not to the subgraph ID itself |
| Labels cut off | Keep labels concise; use `\n` for line breaks in labels |
| Direction ignored | Ensure direction keyword (`TD`, `LR`) is on the same line as `flowchart` |
