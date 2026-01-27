# Mermaid Expert

Expert guidance for Mermaid.js diagramming library.

## Overview

Mermaid Expert provides comprehensive guidance for Mermaid.js, the powerful JavaScript library for creating diagrams and visualizations using text-based syntax. Transform simple text descriptions into professional-looking diagrams that can be embedded in documentation, presentations, and web applications.

## Features

- 📊 **Multiple Diagram Types** - Flowcharts, sequence, class, state, Gantt, and more
- 📝 **Text-Based Syntax** - Easy to write and version control
- 🎨 **Customizable Styling** - Themes and custom CSS
- 🔄 **Live Rendering** - Real-time preview in supported editors
- 📚 **Documentation Ready** - Perfect for README files and docs

## Supported Diagram Types

### Flowcharts
Visualize processes and workflows:

```mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```

### Sequence Diagrams
Show interactions between components:

```mermaid
sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob!
    B->>A: Hi Alice!
```

### Class Diagrams
Represent object-oriented structures:

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +bark()
    }
    Animal <|-- Dog
```

### State Diagrams
Model state machines:

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing
    Processing --> Success
    Processing --> Error
    Success --> [*]
    Error --> Idle
```

### Gantt Charts
Plan project timelines:

```mermaid
gantt
    title Project Schedule
    dateFormat YYYY-MM-DD
    section Phase 1
    Task 1: 2024-01-01, 30d
    Task 2: 2024-01-15, 20d
```

### Git Graphs
Visualize Git workflows:

```mermaid
gitGraph
    commit
    branch develop
    checkout develop
    commit
    checkout main
    merge develop
```

## Usage

Ask for help with any diagram type:

```
Create a flowchart showing the user authentication process
```

```
I need a sequence diagram for API communication
```

```
Show me how to make a Gantt chart in Mermaid
```

## Basic Syntax

### Flowchart Nodes

```mermaid
flowchart LR
    A[Rectangle]
    B(Rounded)
    C([Stadium])
    D[[Subroutine]]
    E[(Database)]
    F((Circle))
```

### Flowchart Arrows

```mermaid
flowchart LR
    A --> B
    C -.-> D
    E ==> F
    G -->|Label| H
```

### Styling

```mermaid
flowchart LR
    A[Node]:::className
    classDef className fill:#f9f,stroke:#333,stroke-width:4px
```

## Best Practices

- Use descriptive node labels
- Keep diagrams focused and not too complex
- Use consistent naming conventions
- Add comments for complex logic
- Choose appropriate diagram types
- Test rendering in target environment

## Integration

Mermaid works with:
- GitHub/GitLab Markdown
- VS Code (with extensions)
- Documentation generators (VitePress, Docusaurus)
- Notion, Obsidian
- Custom web applications

## Configuration

```javascript
mermaid.initialize({
  theme: 'default',
  startOnLoad: true,
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis'
  }
});
```

## Themes

- `default` - Standard theme
- `dark` - Dark mode
- `forest` - Green theme
- `neutral` - Minimal styling

## Common Use Cases

- System architecture diagrams
- User flow documentation
- Database schema visualization
- Project planning
- Process documentation
- API interaction flows

## Requirements

- Modern web browser
- Markdown renderer with Mermaid support (for docs)
- No installation needed for basic use

## Resources

- Official Mermaid documentation
- Live editor: mermaid.live
- Syntax reference
- Example gallery

## Version

Based on Mermaid v11.12.1

## License

MIT
