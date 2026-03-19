---
name: swagger-docs
description: Generate complete Swagger/OpenAPI documentation following RESTful standards with global security, API details, error codes, and validation tests
argument-hint: "[path] [--tool <gemini|qwen|codex>] [--format <yaml|json>] [--version <v3.0|v3.1>] [--lang <zh|en>]"
---

# Swagger API Documentation Workflow (/memory:swagger-docs)

## Overview

Professional Swagger/OpenAPI documentation generator that strictly follows RESTful API design standards to produce enterprise-grade API documentation.

**Core Features**:
- **RESTful Standards**: Strict adherence to REST architecture and HTTP semantics
- **Global Security**: Unified Authorization Token validation mechanism
- **Complete API Docs**: Descriptions, methods, URLs, parameters for each endpoint
- **Organized Structure**: Clear directory hierarchy by business domain
- **Detailed Fields**: Type, required, example, description for each field
- **Error Code Standards**: Unified error response format and code definitions
- **Validation Tests**: Boundary conditions and exception handling tests

**Output Structure** (--lang zh):
```
.workflow/docs/{project_name}/api/
├── swagger.yaml              # Main OpenAPI spec file
├── 概述/
│   ├── README.md             # API overview
│   ├── 认证说明.md           # Authentication guide
│   ├── 错误码规范.md         # Error code definitions
│   └── 版本历史.md           # Version history
├── 用户模块/                 # Grouped by business domain
│   ├── 用户认证.md
│   ├── 用户管理.md
│   └── 权限控制.md
├── 业务模块/
│   └── ...
└── 测试报告/
    ├── 接口测试.md           # API test results
    └── 边界测试.md           # Boundary condition tests
```

**Output Structure** (--lang en):
```
.workflow/docs/{project_name}/api/
├── swagger.yaml              # Main OpenAPI spec file
├── overview/
│   ├── README.md             # API overview
│   ├── authentication.md     # Authentication guide
│   ├── error-codes.md        # Error code definitions
│   └── changelog.md          # Version history
├── users/                    # Grouped by business domain
│   ├── authentication.md
│   ├── management.md
│   └── permissions.md
├── orders/
│   └── ...
└── test-reports/
    ├── api-tests.md          # API test results
    └── boundary-tests.md     # Boundary condition tests
```

## Parameters

```bash
/memory:swagger-docs [path] [--tool <gemini|qwen|codex>] [--format <yaml|json>] [--version <v3.0|v3.1>] [--lang <zh|en>]
```

- **path**: API source code directory (default: current directory)
- **--tool**: CLI tool selection (default: gemini)
  - `gemini`: Comprehensive analysis, pattern recognition
  - `qwen`: Architecture analysis, system design
  - `codex`: Implementation validation, code quality
- **--format**: OpenAPI spec format (default: yaml)
  - `yaml`: YAML format (recommended, better readability)
  - `json`: JSON format
- **--version**: OpenAPI version (default: v3.0)
  - `v3.0`: OpenAPI 3.0.x
  - `v3.1`: OpenAPI 3.1.0 (supports JSON Schema 2020-12)
- **--lang**: Documentation language (default: zh)
  - `zh`: Chinese documentation with Chinese directory names
  - `en`: English documentation with English directory names

## Planning Workflow

### Phase 1: Initialize Session

```bash
# Get project info
bash(pwd && basename "$(pwd)" && git rev-parse --show-toplevel 2>/dev/null || pwd && date +%Y%m%d-%H%M%S)
```

```javascript
// Create swagger-docs session
SlashCommand(command="/workflow:session:start --type swagger-docs --new \"{project_name}-swagger-{timestamp}\"")
// Parse output to get sessionId
```

```bash
# Update workflow-session.json
bash(jq '. + {"target_path":"{target_path}","project_root":"{project_root}","project_name":"{project_name}","format":"yaml","openapi_version":"3.0.3","lang":"{lang}","tool":"gemini"}' .workflow/active/{sessionId}/workflow-session.json > tmp.json && mv tmp.json .workflow/active/{sessionId}/workflow-session.json)
```

### Phase 2: Scan API Endpoints

**Discovery Patterns**: Auto-detect framework signatures and API definition styles.

**Supported Frameworks**:
| Framework | Detection Pattern | Example |
|-----------|-------------------|---------|
| Express.js | `router.get/post/put/delete` | `router.get('/users/:id')` |
| Fastify | `fastify.route`, `@Route` | `fastify.get('/api/users')` |
| NestJS | `@Controller`, `@Get/@Post` | `@Get('users/:id')` |
| Koa | `router.get`, `ctx.body` | `router.get('/users')` |
| Hono | `app.get/post`, `c.json` | `app.get('/users/:id')` |
| FastAPI | `@app.get`, `@router.post` | `@app.get("/users/{id}")` |
| Flask | `@app.route`, `@bp.route` | `@app.route('/users')` |
| Spring | `@GetMapping`, `@PostMapping` | `@GetMapping("/users/{id}")` |
| Go Gin | `r.GET`, `r.POST` | `r.GET("/users/:id")` |
| Go Chi | `r.Get`, `r.Post` | `r.Get("/users/{id}")` |

**Commands**:

```bash
# 1. Detect API framework type
bash(
  if rg -q "@Controller|@Get|@Post|@Put|@Delete" --type ts 2>/dev/null; then echo "NESTJS";
  elif rg -q "router\.(get|post|put|delete|patch)" --type ts --type js 2>/dev/null; then echo "EXPRESS";
  elif rg -q "fastify\.(get|post|route)" --type ts --type js 2>/dev/null; then echo "FASTIFY";
  elif rg -q "@app\.(get|post|put|delete)" --type py 2>/dev/null; then echo "FASTAPI";
  elif rg -q "@GetMapping|@PostMapping|@RequestMapping" --type java 2>/dev/null; then echo "SPRING";
  elif rg -q 'r\.(GET|POST|PUT|DELETE)' --type go 2>/dev/null; then echo "GO_GIN";
  else echo "UNKNOWN"; fi
)

# 2. Scan all API endpoint definitions
bash(rg -n "(router|app|fastify)\.(get|post|put|delete|patch)|@(Get|Post|Put|Delete|Patch|Controller|RequestMapping)" --type ts --type js --type py --type java --type go -g '!*.test.*' -g '!*.spec.*' -g '!node_modules/**' 2>/dev/null | head -200)

# 3. Extract route paths
bash(rg -o "['\"](/api)?/[a-zA-Z0-9/:_-]+['\"]" --type ts --type js --type py -g '!*.test.*' 2>/dev/null | sort -u | head -100)

# 4. Detect existing OpenAPI/Swagger files
bash(find . -type f \( -name "swagger.yaml" -o -name "swagger.json" -o -name "openapi.yaml" -o -name "openapi.json" \) ! -path "*/node_modules/*" 2>/dev/null)

# 5. Extract DTO/Schema definitions
bash(rg -n "export (interface|type|class).*Dto|@ApiProperty|class.*Schema" --type ts -g '!*.test.*' 2>/dev/null | head -100)
```

**Data Processing**: Parse outputs, use **Write tool** to create `${session_dir}/.process/swagger-planning-data.json`:

```json
{
  "metadata": {
    "generated_at": "2025-01-01T12:00:00+08:00",
    "project_name": "project_name",
    "project_root": "/path/to/project",
    "openapi_version": "3.0.3",
    "format": "yaml",
    "lang": "zh"
  },
  "framework": {
    "type": "NESTJS",
    "detected_patterns": ["@Controller", "@Get", "@Post"],
    "base_path": "/api/v1"
  },
  "endpoints": [
    {
      "file": "src/modules/users/users.controller.ts",
      "line": 25,
      "method": "GET",
      "path": "/api/v1/users/:id",
      "handler": "getUser",
      "controller": "UsersController"
    }
  ],
  "existing_specs": {
    "found": false,
    "files": []
  },
  "dto_schemas": [
    {
      "name": "CreateUserDto",
      "file": "src/modules/users/dto/create-user.dto.ts",
      "properties": ["email", "password", "name"]
    }
  ],
  "statistics": {
    "total_endpoints": 45,
    "by_method": {"GET": 20, "POST": 15, "PUT": 5, "DELETE": 5},
    "by_module": {"users": 12, "auth": 8, "orders": 15, "products": 10}
  }
}
```

### Phase 3: Analyze API Structure

**Commands**:

```bash
# 1. Analyze controller/route file structure
bash(cat ${session_dir}/.process/swagger-planning-data.json | jq -r '.endpoints[].file' | sort -u | head -20)

# 2. Extract request/response types
bash(for f in $(jq -r '.dto_schemas[].file' ${session_dir}/.process/swagger-planning-data.json | head -20); do echo "=== $f ===" && cat "$f" 2>/dev/null; done)

# 3. Analyze authentication middleware
bash(rg -n "auth|guard|middleware|jwt|bearer|token" -i --type ts --type js -g '!*.test.*' -g '!node_modules/**' 2>/dev/null | head -50)

# 4. Detect error handling patterns
bash(rg -n "HttpException|BadRequest|Unauthorized|Forbidden|NotFound|throw new" --type ts --type js -g '!*.test.*' 2>/dev/null | head -50)
```

**Deep Analysis via Gemini CLI**:

```bash
ccw cli -p "
PURPOSE: Analyze API structure and generate OpenAPI specification outline for comprehensive documentation
TASK: 
• Parse all API endpoints and identify business module boundaries
• Extract request parameters, request bodies, and response formats
• Identify authentication mechanisms and security requirements
• Discover error handling patterns and error codes
• Map endpoints to logical module groups
MODE: analysis
CONTEXT: @src/**/*.controller.ts @src/**/*.routes.ts @src/**/*.dto.ts @src/**/middleware/**/*
EXPECTED: JSON format API structure analysis report with modules, endpoints, security schemes, and error codes
CONSTRAINTS: Strict RESTful standards | Identify all public endpoints | Document output language: {lang}
" --tool gemini --mode analysis --rule analysis-code-patterns --cd {project_root}
```

**Update swagger-planning-data.json** with analysis results:

```json
{
  "api_structure": {
    "modules": [
      {
        "name": "Users",
        "name_zh": "用户模块",
        "base_path": "/api/v1/users",
        "endpoints": [
          {
            "path": "/api/v1/users",
            "method": "GET",
            "operation_id": "listUsers",
            "summary": "List all users",
            "summary_zh": "获取用户列表",
            "description": "Paginated list of system users with filtering by status and role",
            "description_zh": "分页获取系统用户列表，支持按状态、角色筛选",
            "tags": ["User Management"],
            "tags_zh": ["用户管理"],
            "security": ["bearerAuth"],
            "parameters": {
              "query": ["page", "limit", "status", "role"]
            },
            "responses": {
              "200": "UserListResponse",
              "401": "UnauthorizedError",
              "403": "ForbiddenError"
            }
          }
        ]
      }
    ],
    "security_schemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "JWT Token authentication. Add Authorization: Bearer <token> to request header"
      }
    },
    "error_codes": [
      {"code": "AUTH_001", "status": 401, "message": "Invalid or expired token", "message_zh": "Token 无效或已过期"},
      {"code": "AUTH_002", "status": 401, "message": "Authentication required", "message_zh": "未提供认证信息"},
      {"code": "AUTH_003", "status": 403, "message": "Insufficient permissions", "message_zh": "权限不足"}
    ]
  }
}
```

### Phase 4: Task Decomposition

**Task Hierarchy**:

```
Level 1: Infrastructure Tasks (Parallel)
  ├─ IMPL-001: Generate main OpenAPI spec file (swagger.yaml)
  ├─ IMPL-002: Generate global security config and auth documentation
  └─ IMPL-003: Generate unified error code specification

Level 2: Module Documentation Tasks (Parallel, by business module)
  ├─ IMPL-004: Users module API documentation
  ├─ IMPL-005: Auth module API documentation
  ├─ IMPL-006: Business module N API documentation
  └─ ...

Level 3: Aggregation Tasks (Depends on Level 1-2)
  ├─ IMPL-N+1: Generate API overview and navigation
  └─ IMPL-N+2: Generate version history and changelog

Level 4: Validation Tasks (Depends on Level 1-3)
  ├─ IMPL-N+3: API endpoint validation tests
  └─ IMPL-N+4: Boundary condition tests
```

**Grouping Strategy**:
1. Group by business module (users, orders, products, etc.)
2. Maximum 10 endpoints per task
3. Large modules (>10 endpoints) split by submodules

**Commands**:

```bash
# 1. Count endpoints by module
bash(cat ${session_dir}/.process/swagger-planning-data.json | jq '.statistics.by_module')

# 2. Calculate task groupings
bash(cat ${session_dir}/.process/swagger-planning-data.json | jq -r '.api_structure.modules[] | "\(.name):\(.endpoints | length)"')
```

**Data Processing**: Use **Edit tool** to update `swagger-planning-data.json` with task groups:

```json
{
  "task_groups": {
    "level1_count": 3,
    "level2_count": 5,
    "total_count": 12,
    "assignments": [
      {"task_id": "IMPL-001", "level": 1, "type": "openapi-spec", "title": "Generate OpenAPI main spec file"},
      {"task_id": "IMPL-002", "level": 1, "type": "security", "title": "Generate global security config"},
      {"task_id": "IMPL-003", "level": 1, "type": "error-codes", "title": "Generate error code specification"},
      {"task_id": "IMPL-004", "level": 2, "type": "module-doc", "module": "users", "endpoint_count": 12},
      {"task_id": "IMPL-005", "level": 2, "type": "module-doc", "module": "auth", "endpoint_count": 8}
    ]
  }
}
```

### Phase 5: Generate Task JSONs

**Generation Process**:
1. Read configuration values from workflow-session.json
2. Read task groups from swagger-planning-data.json
3. Generate Level 1 tasks (infrastructure)
4. Generate Level 2 tasks (by module)
5. Generate Level 3-4 tasks (aggregation and validation)

## Task Templates

### Level 1-1: OpenAPI Main Spec File

```json
{
  "id": "IMPL-001",
  "title": "Generate OpenAPI main specification file",
  "status": "pending",
  "meta": {
    "type": "swagger-openapi-spec",
    "agent": "@doc-generator",
    "tool": "gemini",
    "priority": "critical"
  },
  "context": {
    "requirements": [
      "Generate OpenAPI 3.0.3 compliant swagger.yaml",
      "Include complete info, servers, tags, paths, components definitions",
      "Follow RESTful design standards, use {lang} for descriptions"
    ],
    "precomputed_data": {
      "planning_data": "${session_dir}/.process/swagger-planning-data.json"
    }
  },
  "flow_control": {
    "pre_analysis": [
      {
        "step": "load_analysis_data",
        "action": "Load API analysis data",
        "commands": [
          "bash(cat ${session_dir}/.process/swagger-planning-data.json)"
        ],
        "output_to": "api_analysis"
      }
    ],
    "implementation_approach": [
      {
        "step": 1,
        "title": "Generate OpenAPI spec file",
        "description": "Create complete swagger.yaml specification file",
        "cli_prompt": "PURPOSE: Generate OpenAPI 3.0.3 specification file from analyzed API structure\nTASK:\n• Define openapi version: 3.0.3\n• Define info: title, description, version, contact, license\n• Define servers: development, staging, production environments\n• Define tags: organized by business modules\n• Define paths: all API endpoints with complete specifications\n• Define components: schemas, securitySchemes, parameters, responses\nMODE: write\nCONTEXT: @[api_analysis]\nEXPECTED: Complete swagger.yaml file following OpenAPI 3.0.3 specification\nCONSTRAINTS: Use {lang} for all descriptions | Strict RESTful standards\n--rule documentation-swagger-api",
        "output": "swagger.yaml"
      }
    ],
    "target_files": [
      ".workflow/docs/${project_name}/api/swagger.yaml"
    ]
  }
}
```

### Level 1-2: Global Security Configuration

```json
{
  "id": "IMPL-002",
  "title": "Generate global security configuration and authentication guide",
  "status": "pending",
  "meta": {
    "type": "swagger-security",
    "agent": "@doc-generator",
    "tool": "gemini"
  },
  "context": {
    "requirements": [
      "Document Authorization header format in detail",
      "Describe token acquisition, refresh, and expiration mechanisms",
      "List permission requirements for each endpoint"
    ]
  },
  "flow_control": {
    "pre_analysis": [
      {
        "step": "analyze_auth",
        "command": "bash(rg -n 'auth|guard|jwt|bearer' -i --type ts -g '!*.test.*' 2>/dev/null | head -50)",
        "output_to": "auth_patterns"
      }
    ],
    "implementation_approach": [
      {
        "step": 1,
        "title": "Generate authentication documentation",
        "cli_prompt": "PURPOSE: Generate comprehensive authentication documentation for API security\nTASK:\n• Document authentication mechanism: JWT Bearer Token\n• Explain header format: Authorization: Bearer <token>\n• Describe token lifecycle: acquisition, refresh, expiration handling\n• Define permission levels: public, user, admin, super_admin\n• Document authentication failure responses: 401/403 error handling\nMODE: write\nCONTEXT: @[auth_patterns] @src/**/auth/**/* @src/**/guard/**/*\nEXPECTED: Complete authentication guide in {lang}\nCONSTRAINTS: Include code examples | Clear step-by-step instructions\n--rule development-feature",
        "output": "{auth_doc_name}"
      }
    ],
    "target_files": [
      ".workflow/docs/${project_name}/api/{overview_dir}/{auth_doc_name}"
    ]
  }
}
```

### Level 1-3: Unified Error Code Specification

```json
{
  "id": "IMPL-003",
  "title": "Generate unified error code specification",
  "status": "pending",
  "meta": {
    "type": "swagger-error-codes",
    "agent": "@doc-generator",
    "tool": "gemini"
  },
  "context": {
    "requirements": [
      "Define unified error response format",
      "Create categorized error code system (auth, business, system)",
      "Provide detailed description and examples for each error code"
    ]
  },
  "flow_control": {
    "implementation_approach": [
      {
        "step": 1,
        "title": "Generate error code specification document",
        "cli_prompt": "PURPOSE: Generate comprehensive error code specification for consistent API error handling\nTASK:\n• Define error response format: {code, message, details, timestamp}\n• Document authentication errors (AUTH_xxx): 401/403 series\n• Document parameter errors (PARAM_xxx): 400 series\n• Document business errors (BIZ_xxx): business logic errors\n• Document system errors (SYS_xxx): 500 series\n• For each error code: HTTP status, error message, possible causes, resolution suggestions\nMODE: write\nCONTEXT: @src/**/*.exception.ts @src/**/*.filter.ts\nEXPECTED: Complete error code specification in {lang} with tables and examples\nCONSTRAINTS: Include response examples | Clear categorization\n--rule development-feature",
        "output": "{error_doc_name}"
      }
    ],
    "target_files": [
      ".workflow/docs/${project_name}/api/{overview_dir}/{error_doc_name}"
    ]
  }
}
```

### Level 2: Module API Documentation (Template)

```json
{
  "id": "IMPL-${module_task_id}",
  "title": "Generate ${module_name} API documentation",
  "status": "pending",
  "depends_on": ["IMPL-001", "IMPL-002", "IMPL-003"],
  "meta": {
    "type": "swagger-module-doc",
    "agent": "@doc-generator",
    "tool": "gemini",
    "module": "${module_name}",
    "endpoint_count": "${endpoint_count}"
  },
  "context": {
    "requirements": [
      "Complete documentation for all endpoints in this module",
      "Each endpoint: description, method, URL, parameters, responses",
      "Include success and failure response examples",
      "Mark API version and last update time"
    ],
    "focus_paths": ["${module_source_paths}"]
  },
  "flow_control": {
    "pre_analysis": [
      {
        "step": "load_module_endpoints",
        "action": "Load module endpoint information",
        "commands": [
          "bash(cat ${session_dir}/.process/swagger-planning-data.json | jq '.api_structure.modules[] | select(.name == \"${module_name}\")')"
        ],
        "output_to": "module_endpoints"
      },
      {
        "step": "read_source_files",
        "action": "Read module source files",
        "commands": [
          "bash(cat ${module_source_files})"
        ],
        "output_to": "source_code"
      }
    ],
    "implementation_approach": [
      {
        "step": 1,
        "title": "Generate module API documentation",
        "description": "Generate complete API documentation for ${module_name}",
        "cli_prompt": "PURPOSE: Generate complete RESTful API documentation for ${module_name} module\nTASK:\n• Create module overview: purpose, use cases, prerequisites\n• Generate endpoint index: grouped by functionality\n• For each endpoint document:\n  - Functional description: purpose and business context\n  - Request method: GET/POST/PUT/DELETE\n  - URL path: complete API path\n  - Request headers: Authorization and other required headers\n  - Path parameters: {id} and other path variables\n  - Query parameters: pagination, filters, etc.\n  - Request body: JSON Schema format\n  - Response body: success and error responses\n  - Field description table: type, required, example, description\n• Add usage examples: cURL, JavaScript, Python\n• Add version info: v1.0.0, last updated date\nMODE: write\nCONTEXT: @[module_endpoints] @[source_code]\nEXPECTED: Complete module API documentation in {lang} with all endpoints fully documented\nCONSTRAINTS: RESTful standards | Include all response codes\n--rule documentation-swagger-api",
        "output": "${module_doc_name}"
      }
    ],
    "target_files": [
      ".workflow/docs/${project_name}/api/${module_dir}/${module_doc_name}"
    ]
  }
}
```

### Level 3: API Overview and Navigation

```json
{
  "id": "IMPL-${overview_task_id}",
  "title": "Generate API overview and navigation",
  "status": "pending",
  "depends_on": ["IMPL-001", "...", "IMPL-${last_module_task_id}"],
  "meta": {
    "type": "swagger-overview",
    "agent": "@doc-generator",
    "tool": "gemini"
  },
  "flow_control": {
    "pre_analysis": [
      {
        "step": "load_all_docs",
        "command": "bash(find .workflow/docs/${project_name}/api -type f -name '*.md' ! -path '*/{overview_dir}/*' | xargs cat)",
        "output_to": "all_module_docs"
      }
    ],
    "implementation_approach": [
      {
        "step": 1,
        "title": "Generate API overview",
        "cli_prompt": "PURPOSE: Generate API overview document with navigation and quick start guide\nTASK:\n• Create introduction: system features, tech stack, version\n• Write quick start guide: authentication, first request example\n• Build module navigation: categorized links to all modules\n• Document environment configuration: development, staging, production\n• List SDKs and tools: client libraries, Postman collection\nMODE: write\nCONTEXT: @[all_module_docs] @.workflow/docs/${project_name}/api/swagger.yaml\nEXPECTED: Complete API overview in {lang} with navigation links\nCONSTRAINTS: Clear structure | Quick start focus\n--rule development-feature",
        "output": "README.md"
      }
    ],
    "target_files": [
      ".workflow/docs/${project_name}/api/{overview_dir}/README.md"
    ]
  }
}
```

### Level 4: Validation Tasks

```json
{
  "id": "IMPL-${test_task_id}",
  "title": "API endpoint validation tests",
  "status": "pending",
  "depends_on": ["IMPL-${overview_task_id}"],
  "meta": {
    "type": "swagger-validation",
    "agent": "@test-fix-agent",
    "tool": "codex"
  },
  "context": {
    "requirements": [
      "Validate accessibility of all endpoints",
      "Test various boundary conditions",
      "Verify exception handling"
    ]
  },
  "flow_control": {
    "pre_analysis": [
      {
        "step": "load_swagger_spec",
        "command": "bash(cat .workflow/docs/${project_name}/api/swagger.yaml)",
        "output_to": "swagger_spec"
      }
    ],
    "implementation_approach": [
      {
        "step": 1,
        "title": "Generate test report",
        "cli_prompt": "PURPOSE: Generate comprehensive API test validation report\nTASK:\n• Document test environment configuration\n• Calculate endpoint coverage statistics\n• Report test results: pass/fail counts\n• Document boundary tests: parameter limits, null values, special characters\n• Document exception tests: auth failures, permission denied, resource not found\n• List issues found with recommendations\nMODE: write\nCONTEXT: @[swagger_spec]\nEXPECTED: Complete test report in {lang} with detailed results\nCONSTRAINTS: Include test cases | Clear pass/fail status\n--rule development-tests",
        "output": "{test_doc_name}"
      }
    ],
    "target_files": [
      ".workflow/docs/${project_name}/api/{test_dir}/{test_doc_name}"
    ]
  }
}
```

## Language-Specific Directory Mapping

| Component | --lang zh | --lang en |
|-----------|-----------|-----------|
| Overview dir | 概述 | overview |
| Auth doc | 认证说明.md | authentication.md |
| Error doc | 错误码规范.md | error-codes.md |
| Changelog | 版本历史.md | changelog.md |
| Users module | 用户模块 | users |
| Orders module | 订单模块 | orders |
| Products module | 商品模块 | products |
| Test dir | 测试报告 | test-reports |
| API test doc | 接口测试.md | api-tests.md |
| Boundary test doc | 边界测试.md | boundary-tests.md |

## API Documentation Template

### Single Endpoint Format

Each endpoint must include:

```markdown
### Get User Details

**Description**: Retrieve detailed user information by ID, including profile and permissions.

**Endpoint Info**:

| Property | Value |
|----------|-------|
| Method | GET |
| URL | `/api/v1/users/{id}` |
| Version | v1.0.0 |
| Updated | 2025-01-01 |
| Auth | Bearer Token |
| Permission | user / admin |

**Request Headers**:

| Field | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| Authorization | string | Yes | `Bearer eyJhbGc...` | JWT Token |
| Content-Type | string | No | `application/json` | Request content type |

**Path Parameters**:

| Field | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | `usr_123456` | Unique user identifier |

**Query Parameters**:

| Field | Type | Required | Default | Example | Description |
|-------|------|----------|---------|---------|-------------|
| include | string | No | - | `roles,permissions` | Related data to include |

**Success Response** (200 OK):

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "usr_123456",
    "email": "user@example.com",
    "name": "John Doe",
    "status": "active",
    "roles": ["user"],
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  },
  "timestamp": "2025-01-01T12:00:00Z"
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| code | integer | Business status code, 0 = success |
| message | string | Response message |
| data.id | string | Unique user identifier |
| data.email | string | User email address |
| data.name | string | User display name |
| data.status | string | User status: active/inactive/suspended |
| data.roles | array | User role list |
| data.created_at | string | Creation timestamp (ISO 8601) |
| data.updated_at | string | Last update timestamp (ISO 8601) |

**Error Responses**:

| Status | Code | Message | Possible Cause |
|--------|------|---------|----------------|
| 401 | AUTH_001 | Invalid or expired token | Token format error or expired |
| 403 | AUTH_003 | Insufficient permissions | No access to this user info |
| 404 | USER_001 | User not found | User ID doesn't exist or deleted |

**Examples**:

```bash
# cURL
curl -X GET "https://api.example.com/api/v1/users/usr_123456" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

```javascript
// JavaScript (fetch)
const response = await fetch('https://api.example.com/api/v1/users/usr_123456', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGc...',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```
```

## Session Structure

```
.workflow/active/
└── WFS-swagger-{timestamp}/
    ├── workflow-session.json
    ├── IMPL_PLAN.md
    ├── TODO_LIST.md
    ├── .process/
    │   └── swagger-planning-data.json
    └── .task/
        ├── IMPL-001.json              # OpenAPI spec
        ├── IMPL-002.json              # Security config
        ├── IMPL-003.json              # Error codes
        ├── IMPL-004.json              # Module 1 API
        ├── ...
        ├── IMPL-N+1.json              # API overview
        └── IMPL-N+2.json              # Validation tests
```

## Execution Commands

```bash
# Execute entire workflow
/workflow:execute

# Specify session
/workflow:execute --resume-session="WFS-swagger-yyyymmdd-hhmmss"

# Single task execution
/task:execute IMPL-001
```

## Related Commands

- `/workflow:execute` - Execute documentation tasks
- `/workflow:status` - View task progress
- `/workflow:session:complete` - Mark session complete
- `/memory:docs` - General documentation workflow
