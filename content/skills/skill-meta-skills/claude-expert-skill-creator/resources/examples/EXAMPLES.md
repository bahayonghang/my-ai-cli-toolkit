# Domain Examples

Real-world skill patterns for common use cases.

---

## Example 1: Billing System Migration

**Context:** Company migrating from legacy billing to modern system.

**Discovery questions:**
1. What format is legacy data? (CSV, JSON, database dump?)
2. What's the target format for new system?
3. Are there data transformations needed? (field mapping, calculations?)
4. Any validation rules to enforce?
5. How should errors be handled?

**Resulting structure:**
```
billing-migration/
├── SKILL.md                       # Migration workflow
├── scripts/
│   ├── validate_legacy.py         # Check data completeness
│   ├── transform.py               # Map fields to new format
│   └── verify_totals.py           # Verify financial totals match
└── resources/
    ├── schemas/
    │   ├── legacy.json            # Legacy data schema
    │   └── modern.json            # Target schema
    └── mappings/
        └── field_mapping.json     # Field-to-field mapping
```

**Token efficiency:**
- Description: ~25 tokens
- SKILL.md: ~400 tokens
- Scripts: 0 tokens (execution is free)
- resources/: ~1200 tokens (loaded only for complex cases)

---

## Example 2: API Integration

**Context:** Integrating with external API, handling auth, rate limits, retries.

**Discovery questions:**
1. What API? (OpenAPI spec available?)
2. What endpoints are used most?
3. How does authentication work?
4. Are there rate limits to handle?
5. What error cases need special handling?

**Resulting structure:**
```
api-integration/
├── SKILL.md                       # Common API patterns
├── scripts/
│   ├── authenticate.py            # Handle OAuth flow
│   ├── request.py                 # Wrapper with retry logic
│   └── rate_limiter.py            # Respect rate limits
└── resources/
    ├── openapi.json               # API specification
    └── templates/
        └── request.json           # Request body templates
```

---

## Example 3: Data Schema Mapping

**Context:** Mapping between two data formats with transformations.

**Discovery questions:**
1. What are the source and target schemas?
2. Are transformations simple (rename) or complex (calculations)?
3. What happens to unmapped fields?
4. How should validation errors be handled?

**Resulting structure:**
```
schema-mapper/
├── SKILL.md                       # Mapping workflow
├── scripts/
│   ├── validate_source.py         # Check source data
│   ├── map_fields.py              # Apply mapping rules
│   └── validate_target.py         # Verify output
└── resources/
    ├── schemas/
    │   ├── source.json
    │   └── target.json
    └── mappings.json              # Field mapping rules
```

---

## Common Patterns

### Pattern: Validation Script
Every skill that processes data should include validation:

```python
def validate(data, schema_path):
    """Validate data against JSON schema."""
    with open(schema_path) as f:
        schema = json.load(f)
    
    errors = []
    for i, item in enumerate(data):
        try:
            jsonschema.validate(item, schema)
        except jsonschema.ValidationError as e:
            errors.append({"index": i, "error": e.message, "path": list(e.path)})
    
    return {"valid": len(errors) == 0, "errors": errors}
```

### Pattern: Transformation Script
For data conversion:

```python
def transform(source_data, mapping):
    """Transform data using field mapping."""
    results = []
    for item in source_data:
        transformed = {}
        for target_field, source_field in mapping.items():
            if isinstance(source_field, str):
                transformed[target_field] = item.get(source_field)
            elif callable(source_field):
                transformed[target_field] = source_field(item)
        results.append(transformed)
    return results
```

### Pattern: Error Accumulation
Never fail on first error - collect all issues:

```python
def process_batch(items):
    results = {"success": [], "errors": []}
    for item in items:
        try:
            results["success"].append(process_one(item))
        except Exception as e:
            results["errors"].append({"item_id": item.get("id"), "error": str(e)})
    return results
```
