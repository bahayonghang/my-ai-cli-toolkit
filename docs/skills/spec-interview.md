# spec-interview

Systematic interview to refine technical specifications with OpenSpec integration for spec-driven development.

## Overview

Transform draft specifications into complete, executable technical documents through in-depth Socratic interviews. Automatically creates OpenSpec proposals after interviews to lock requirements before code is written.

## Use Cases

- Refine `plan.md` or other specification documents
- Systematically clarify requirements through questioning
- Generate OpenSpec proposals for spec-driven development
- Cover technical implementation, UI/UX, edge cases, and risk assessment
- Apply engineering principles (KISS, YAGNI, DRY, SOLID)

## Trigger Keywords

- "Help me refine this plan"
- "Interview me about the project"
- "Create a spec proposal"
- "Spec-driven development"
- When draft specs need comprehensive refinement

## Workflow

### 1. Document Analysis

Reads `plan.md` or user-specified documents to understand:
- Core business objectives and value proposition
- Existing technical solutions
- Ambiguous or missing information
- Potential technical debt and risks

### 2. Systematic Interview

Conducts multi-dimensional deep interviews using `AskUserQuestionTool`:

**A. Engineering Principles Review (Required)**
- KISS & YAGNI: Is this feature MVP-required? Can it be simplified?
- DRY: Identify patterns for abstraction
- SOLID: Single responsibility, extensible interfaces, dependency management

**B. Technical Implementation**
- Technology stack selection and rationale
- Data structures and algorithms
- Performance bottlenecks and optimization
- Third-party dependencies and risks
- Testing strategy

**C. API Design (If Applicable)**
- API clarity and logical grouping
- Request/response models
- Authentication and authorization
- Error handling and status codes
- Versioning strategy

**D. UI/UX Design (If Applicable)**
- User interaction flows
- Edge case UI feedback
- Responsive design and accessibility
- Internationalization

**E. Risk Assessment**
- Technical debt tolerance
- Security considerations
- Maintainability vs speed tradeoffs
- Cost estimation

**F. Edge Cases & Exception Handling**
- Network failures, timeouts, retries
- Concurrency conflicts
- Fallback strategies
- Logging and monitoring

### 3. High-Risk Operation Detection

Proactively warns about:
- File deletions
- Git force pushes
- Environment variable changes
- Database structure changes
- Bulk dependency updates

### 4. OpenSpec Proposal Creation

After interview completion, automatically creates an OpenSpec proposal:

**Commands by Platform:**
- Claude Code / Codex / Qoder / RooCode: `/openspec:proposal`
- Cursor / Continue / GitHub Copilot / Windsurf: `/openspec-proposal`
- Other tools (AGENTS.md compatible): "Create an OpenSpec proposal"

**Generated Structure:**
```
openspec/
├── changes/
│   └── <change-name>/
│       ├── proposal.md          # Change proposal
│       ├── tasks.md             # Task checklist
│       └── specs/               # Spec deltas
│           └── <spec-name>/
│               └── spec.md      # Spec changes
└── specs/                       # Current specs (updated after archiving)
    └── <spec-name>/
        └── spec.md
```

**Generated Files:**

1. **Proposal** (`openspec/changes/<change-name>/proposal.md`)
   - Change overview and business value
   - Technical solution and architecture decisions
   - Engineering principles review results
   - Risk assessment and mitigation
   - Success criteria

2. **Tasks** (`openspec/changes/<change-name>/tasks.md`)
   - Implementation task list
   - Priority ordering (high/medium/low)
   - Task dependencies
   - Effort estimates

3. **Spec Deltas** (`openspec/changes/<change-name>/specs/*/spec.md`)
   - Spec changes in delta format:
     ```markdown
     ## New Features
     +++ New content description
     
     ## Modified Features
     --- Deleted old content
     +++ New replacement content
     
     ## Removed Features
     --- Deleted content
     ```

### 5. Follow-up Workflow

After proposal creation:

1. **Review & Refine**
   - Check generated proposal and specs
   - Adjust and supplement as needed

2. **Implement Changes**
   - Use `/openspec:apply` or `/openspec-apply`
   - System implements based on tasks.md

3. **Archive Changes**
   - After implementation, use `/openspec:archive` or `/openspec-archive`
   - Merges spec deltas into `openspec/specs/`

## Interview Principles

1. **Depth-First**: Avoid obvious questions, uncover hidden assumptions and risks
2. **Structured**: Follow engineering principles → technical details → risk tradeoffs
3. **Guided**: Help users think "why" not just "what"
4. **Pragmatic**: Focus on implementability, avoid over-theorization
5. **Context-Aware**: Adjust interview focus based on project type (API/CLI/library/app)

## OpenSpec Integration Benefits

1. **Requirement Locking**: Interview results solidified as proposals, preventing loss in chat history
2. **Traceability**: All decisions and tradeoffs recorded in proposals
3. **Reviewability**: Team members can review proposals without reading code
4. **Incremental Development**: Spec deltas clearly show impact scope of each change
5. **Documentation Sync**: Archiving automatically updates living specs, keeping docs and code in sync

## Example Dialogue

**Step 1: Start Interview**

> **User**: Help me refine this plan
> 
> **System**: Read `plan.md`. This project plans to build a user management API. Before starting the interview, please confirm: Is this a public-facing API or an internal service?

**Step 2: Deep Questioning**

> **User**: Internal service
> 
> **System**: Understood. For authentication, internal services typically have several options:
> 1. Shared secrets between services (simple but less secure)
> 2. mTLS (high security but complex configuration)
> 3. Internal OAuth 2.0 (flexible but requires additional infrastructure)
> 
> Considering your team size and operational capabilities, which approach do you prefer? Or do you already have a unified internal authentication standard?

**Step 3: Engineering Principles Review**

> **System**: Regarding user role management, how many roles do you plan to support? Is this an MVP-required feature?
> 
> Following the YAGNI principle, if initially you only need admin and regular user roles, I suggest implementing a simple binary permission model first, then expanding to RBAC later. This can reduce development time by 30-40%. What are your thoughts?

**Step 4: Create OpenSpec Proposal**

> **System**: Interview complete! Now creating OpenSpec proposal for you...
> 
> [Calls /openspec:proposal or equivalent]
> 
> ✅ Created proposal: `openspec/changes/user-management-api/`
> 
> Next steps:
> 1. Review `proposal.md` and `tasks.md`
> 2. Use `/openspec:apply` to start implementation
> 3. After completion, use `/openspec:archive` to archive

## Best Practices

- **Prepare Well**: Have business context and constraints ready before interview
- **Answer Honestly**: For uncertain questions, request multiple options with tradeoff analysis
- **Iterative Refinement**: Continue interviewing to refine after proposal creation
- **Team Collaboration**: Share proposals with team members for review
- **Continuous Archiving**: Archive completed changes promptly to keep specs directory accurate

## References

- [OpenSpec Official Documentation](https://github.com/Fission-AI/OpenSpec)
- [OpenSpec Website](https://openspec.dev/)
- [Spec-Driven Development Guide](https://redreamality.com/garden/notes/openspec-guide)
