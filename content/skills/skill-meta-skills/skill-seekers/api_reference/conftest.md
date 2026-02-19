# API Reference: conftest.py

**Language**: Python

**Source**: `tests/conftest.py`

---

## Functions

### pytest_configure(config)

Check if package is installed before running tests.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config | None | - | - |

**Returns**: (none)



### anyio_backend()

Override anyio backend to only use asyncio (not trio).

**Returns**: (none)


