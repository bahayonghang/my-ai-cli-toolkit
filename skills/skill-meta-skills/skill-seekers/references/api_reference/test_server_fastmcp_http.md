# API Reference: test_server_fastmcp_http.py

**Language**: Python

**Source**: `tests/test_server_fastmcp_http.py`

---

## Classes

### TestFastMCPHTTP

Test FastMCP HTTP transport functionality.

**Inherits from**: (none)

#### Methods

##### test_health_check_endpoint(self)

Test that health check endpoint returns correct response.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_sse_endpoint_exists(self)

Test that SSE endpoint is available.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cors_middleware(self)

Test that CORS middleware can be added.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestArgumentParsing

Test command-line argument parsing.

**Inherits from**: (none)

#### Methods

##### test_parse_args_default(self)

Test default argument parsing (stdio mode).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_parse_args_http_mode(self)

Test HTTP mode argument parsing.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_parse_args_log_level(self)

Test log level argument parsing.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




## Functions

### health_check(_request)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| _request | None | - | - |

**Returns**: (none)


