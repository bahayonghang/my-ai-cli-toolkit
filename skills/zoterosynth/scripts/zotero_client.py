# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "pyzotero>=1.5.18",
# ]
# ///
"""
ZoteroSynth CLI - Zotero data access with three-tier fallback.

Usage:
    uv run scripts/zotero_client.py <command> [options]

Commands:
    check                           Environment detection
    collections [--tree]            List collections
    items [--collection KEY] [--limit N]  List items
    search QUERY [--limit N]        Search items
    detail KEY                      Item metadata
    children KEY                    Child items (attachments/notes)
    fulltext KEY                    Full text content
    pdf-path KEY                    PDF file path
"""

import json
import os
import shutil
import sqlite3
import sys
import tempfile
import urllib.request
from argparse import ArgumentParser
from pathlib import Path


def _json_out(status: str, data=None, **kwargs):
    """Print JSON result and exit."""
    result = {"status": status, **({"data": data} if data is not None else {}), **kwargs}
    if data is not None and isinstance(data, list):
        result["count"] = len(data)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(0 if status == "ok" else 1)


# ---------------------------------------------------------------------------
# Backend detection
# ---------------------------------------------------------------------------


def _detect_local_api() -> bool:
    try:
        req = urllib.request.Request(
            "http://localhost:23119/api/users/0/items?limit=1",
            headers={"Accept": "application/json"},
        )
        resp = urllib.request.urlopen(req, timeout=2)
        return resp.status == 200
    except Exception:
        return False


def _candidate_sqlite_paths() -> list[Path]:
    candidates = []
    custom = os.environ.get("ZOTERO_DATA_DIR")
    if custom:
        candidates.append(Path(custom) / "zotero.sqlite")
    candidates.append(Path.home() / "Zotero" / "zotero.sqlite")
    return candidates


def _find_sqlite() -> Path | None:
    for p in _candidate_sqlite_paths():
        if p.exists():
            return p
    return None


def _detect_backend() -> str:
    if _detect_local_api():
        return "local_api"
    if _find_sqlite():
        return "sqlite"
    if os.environ.get("ZOTERO_API_KEY"):
        return "web_api"
    return "none"


def _data_dir() -> Path | None:
    """Return Zotero data directory (parent of zotero.sqlite)."""
    custom = os.environ.get("ZOTERO_DATA_DIR")
    if custom:
        return Path(custom)
    default = Path.home() / "Zotero"
    if (default / "zotero.sqlite").exists():
        return default
    return None


# ---------------------------------------------------------------------------
# Local API helpers
# ---------------------------------------------------------------------------


def _api_get(endpoint: str, params: dict | None = None) -> list | dict:
    url = f"http://localhost:23119/api/users/0/{endpoint}"
    if params:
        qs = "&".join(f"{k}={v}" for k, v in params.items() if v is not None)
        if qs:
            url += f"?{qs}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    resp = urllib.request.urlopen(req, timeout=10)
    return json.loads(resp.read().decode())


def _api_collections(tree: bool = False) -> list[dict]:
    raw = _api_get("collections")
    items = [
        {"key": c["key"], "name": c["data"]["name"], "parentCollection": c["data"].get("parentCollection", False)} for c in raw
    ]
    if not tree:
        return items
    return _build_tree(items)


def _build_tree(items: list[dict], parent=False, depth=0) -> list[dict]:
    result = []
    for item in items:
        if item["parentCollection"] == parent:
            item["depth"] = depth
            item["children"] = _build_tree(items, item["key"], depth + 1)
            result.append(item)
    return result


def _api_items(collection_key: str | None = None, limit: int = 50) -> list[dict]:
    if collection_key:
        raw = _api_get(f"collections/{collection_key}/items/top", {"limit": str(limit)})
    else:
        raw = _api_get("items/top", {"limit": str(limit)})
    return [_simplify_item(i) for i in raw if i["data"].get("itemType") != "attachment"]


def _simplify_item(raw: dict) -> dict:
    d = raw["data"]
    creators = d.get("creators", [])
    authors = "; ".join(
        f"{c.get('lastName', '')}, {c.get('firstName', '')}" if "lastName" in c else c.get("name", "") for c in creators
    )
    return {
        "key": d["key"],
        "itemType": d.get("itemType", ""),
        "title": d.get("title", ""),
        "authors": authors,
        "date": d.get("date", ""),
        "publicationTitle": d.get("publicationTitle", ""),
        "DOI": d.get("DOI", ""),
        "tags": [t["tag"] for t in d.get("tags", [])],
    }


def _api_search(query: str, limit: int = 20) -> list[dict]:
    raw = _api_get("items", {"q": query, "limit": str(limit), "qmode": "everything"})
    return [_simplify_item(i) for i in raw if i["data"].get("itemType") != "attachment"]


def _api_detail(key: str) -> dict:
    raw = _api_get(f"items/{key}")
    if isinstance(raw, dict):
        return _simplify_item(raw)
    return {"error": "Unexpected response format"}


def _api_children(key: str) -> list[dict]:
    raw = _api_get(f"items/{key}/children")
    result = []
    for c in raw:
        d = c["data"]
        entry = {"key": d["key"], "itemType": d.get("itemType", "")}
        if d.get("itemType") == "attachment":
            entry["contentType"] = d.get("contentType", "")
            entry["filename"] = d.get("filename", "")
            entry["linkMode"] = d.get("linkMode", "")
        elif d.get("itemType") == "note":
            entry["note"] = d.get("note", "")[:500]
        result.append(entry)
    return result


def _api_fulltext(key: str) -> str:
    """Get full text via local API (Zotero 7.1+/8)."""
    try:
        data = _api_get(f"fulltext/{key}")
        if isinstance(data, dict):
            return data.get("content", "")
        return ""
    except Exception:
        return ""


def _api_pdf_path(key: str) -> str | None:
    children = _api_children(key)
    dd = _data_dir()
    if not dd:
        return None
    for c in children:
        if c.get("contentType") == "application/pdf":
            storage = dd / "storage" / c["key"]
            if storage.exists():
                for f in storage.iterdir():
                    if f.suffix.lower() == ".pdf":
                        return str(f)
    return None


# ---------------------------------------------------------------------------
# SQLite helpers
# ---------------------------------------------------------------------------


def _sqlite_connect() -> sqlite3.Connection:
    db_path = _find_sqlite()
    if not db_path:
        raise FileNotFoundError("zotero.sqlite not found")
    # Copy to temp to avoid lock conflicts
    tmp = Path(tempfile.gettempdir()) / "zotero_synth_readonly.sqlite"
    shutil.copy2(db_path, tmp)
    conn = sqlite3.connect(f"file:{tmp}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    return conn


SQL_COLLECTIONS = """
SELECT c.collectionID, c.collectionName, c.parentCollectionID, c.key
FROM collections c ORDER BY c.collectionName
"""

SQL_ITEMS_BASE = """
SELECT i.itemID, i.key,
       MAX(CASE WHEN f.fieldName='title' THEN idv.value END) AS title,
       MAX(CASE WHEN f.fieldName='date' THEN idv.value END) AS date,
       MAX(CASE WHEN f.fieldName='publicationTitle' THEN idv.value END) AS publicationTitle,
       MAX(CASE WHEN f.fieldName='DOI' THEN idv.value END) AS DOI
FROM items i
JOIN itemData id ON i.itemID = id.itemID
JOIN fields f ON id.fieldID = f.fieldID
JOIN itemDataValues idv ON id.valueID = idv.valueID
WHERE i.itemID NOT IN (SELECT itemID FROM deletedItems)
  AND i.itemTypeID NOT IN (SELECT itemTypeID FROM itemTypes WHERE typeName='attachment')
"""

SQL_ITEMS_BY_COLLECTION = (
    SQL_ITEMS_BASE
    + """
  AND i.itemID IN (SELECT itemID FROM collectionItems WHERE collectionID =
      (SELECT collectionID FROM collections WHERE key = ?))
GROUP BY i.itemID
"""
)

SQL_ITEMS_ALL = SQL_ITEMS_BASE + "GROUP BY i.itemID"

SQL_SEARCH = (
    SQL_ITEMS_BASE
    + """
  AND (idv.value LIKE ? COLLATE NOCASE)
GROUP BY i.itemID
"""
)

SQL_AUTHORS = """
SELECT c.lastName, c.firstName
FROM itemCreators ic
JOIN creators c ON ic.creatorID = c.creatorID
WHERE ic.itemID = ?
ORDER BY ic.orderIndex
"""

SQL_PDF_PATH = """
SELECT ia.path, i2.key AS attachmentKey
FROM itemAttachments ia
JOIN items i2 ON ia.itemID = i2.itemID
WHERE ia.parentItemID = (SELECT itemID FROM items WHERE key = ?)
  AND ia.contentType = 'application/pdf'
"""


def _sqlite_collections(tree: bool = False) -> list[dict]:
    conn = _sqlite_connect()
    rows = conn.execute(SQL_COLLECTIONS).fetchall()
    conn.close()
    items = [
        {"key": r["key"], "name": r["collectionName"], "parentCollection": r["parentCollectionID"] or False} for r in rows
    ]
    if not tree:
        return items
    # For tree, need to map IDs to keys
    id_to_key = {r["collectionID"]: r["key"] for r in rows}
    for item in items:
        pid = item["parentCollection"]
        item["parentCollection"] = id_to_key.get(pid, False) if pid else False
    return _build_tree(items)


def _sqlite_items(collection_key: str | None = None, limit: int = 50) -> list[dict]:
    conn = _sqlite_connect()
    if collection_key:
        rows = conn.execute(SQL_ITEMS_BY_COLLECTION + f" LIMIT {limit}", (collection_key,)).fetchall()
    else:
        rows = conn.execute(SQL_ITEMS_ALL + f" LIMIT {limit}").fetchall()
    result = []
    for r in rows:
        authors_rows = conn.execute(SQL_AUTHORS, (r["itemID"],)).fetchall()
        authors = "; ".join(f"{a['lastName']}, {a['firstName']}" for a in authors_rows)
        result.append(
            {
                "key": r["key"],
                "title": r["title"] or "",
                "authors": authors,
                "date": r["date"] or "",
                "publicationTitle": r["publicationTitle"] or "",
                "DOI": r["DOI"] or "",
            }
        )
    conn.close()
    return result


def _sqlite_search(query: str, limit: int = 20) -> list[dict]:
    conn = _sqlite_connect()
    rows = conn.execute(SQL_SEARCH + f" LIMIT {limit}", (f"%{query}%",)).fetchall()
    result = []
    for r in rows:
        authors_rows = conn.execute(SQL_AUTHORS, (r["itemID"],)).fetchall()
        authors = "; ".join(f"{a['lastName']}, {a['firstName']}" for a in authors_rows)
        result.append(
            {
                "key": r["key"],
                "title": r["title"] or "",
                "authors": authors,
                "date": r["date"] or "",
                "publicationTitle": r["publicationTitle"] or "",
                "DOI": r["DOI"] or "",
            }
        )
    conn.close()
    return result


def _sqlite_detail(key: str) -> dict:
    items = _sqlite_search(key, limit=1)
    # Fallback: search by key directly
    if not items:
        conn = _sqlite_connect()
        rows = conn.execute(SQL_ITEMS_BASE + " AND i.key = ? GROUP BY i.itemID", (key,)).fetchall()
        if rows:
            r = rows[0]
            authors_rows = conn.execute(SQL_AUTHORS, (r["itemID"],)).fetchall()
            authors = "; ".join(f"{a['lastName']}, {a['firstName']}" for a in authors_rows)
            items = [
                {
                    "key": r["key"],
                    "title": r["title"] or "",
                    "authors": authors,
                    "date": r["date"] or "",
                    "publicationTitle": r["publicationTitle"] or "",
                    "DOI": r["DOI"] or "",
                }
            ]
        conn.close()
    return items[0] if items else {"error": "Item not found"}


def _sqlite_pdf_path(key: str) -> str | None:
    conn = _sqlite_connect()
    rows = conn.execute(SQL_PDF_PATH, (key,)).fetchall()
    conn.close()
    dd = _data_dir()
    if not dd or not rows:
        return None
    for r in rows:
        att_key = r["attachmentKey"]
        storage = dd / "storage" / att_key
        if storage.exists():
            for f in storage.iterdir():
                if f.suffix.lower() == ".pdf":
                    return str(f)
        # Try path field (format: "storage:filename.pdf")
        path_val = r["path"] or ""
        if path_val.startswith("storage:"):
            fname = path_val[len("storage:") :]
            candidate = dd / "storage" / att_key / fname
            if candidate.exists():
                return str(candidate)
    return None


# ---------------------------------------------------------------------------
# Web API helpers (via pyzotero)
# ---------------------------------------------------------------------------


def _get_pyzotero():
    from pyzotero import zotero

    lib_id = os.environ.get("ZOTERO_LIBRARY_ID", "")
    api_key = os.environ.get("ZOTERO_API_KEY", "")
    lib_type = os.environ.get("ZOTERO_LIBRARY_TYPE", "user")
    return zotero.Zotero(lib_id, lib_type, api_key)


def _web_collections(tree: bool = False) -> list[dict]:
    zot = _get_pyzotero()
    raw = zot.collections()
    items = [
        {"key": c["key"], "name": c["data"]["name"], "parentCollection": c["data"].get("parentCollection", False)} for c in raw
    ]
    return _build_tree(items) if tree else items


def _web_items(collection_key: str | None = None, limit: int = 50) -> list[dict]:
    zot = _get_pyzotero()
    if collection_key:
        raw = zot.collection_items_top(collection_key, limit=limit)
    else:
        raw = zot.top(limit=limit)
    return [_simplify_item(i) for i in raw if i["data"].get("itemType") != "attachment"]


def _web_search(query: str, limit: int = 20) -> list[dict]:
    zot = _get_pyzotero()
    raw = zot.items(q=query, qmode="everything", limit=limit)
    return [_simplify_item(i) for i in raw if i["data"].get("itemType") != "attachment"]


def _web_detail(key: str) -> dict:
    zot = _get_pyzotero()
    raw = zot.item(key)
    return _simplify_item(raw)


def _web_children(key: str) -> list[dict]:
    zot = _get_pyzotero()
    raw = zot.children(key)
    result = []
    for c in raw:
        d = c["data"]
        entry = {"key": d["key"], "itemType": d.get("itemType", "")}
        if d.get("itemType") == "attachment":
            entry["contentType"] = d.get("contentType", "")
            entry["filename"] = d.get("filename", "")
        elif d.get("itemType") == "note":
            entry["note"] = d.get("note", "")[:500]
        result.append(entry)
    return result


# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------


def dispatch(backend: str, command: str, **kwargs):
    """Route command to the appropriate backend."""
    handlers = {
        "local_api": {
            "collections": lambda: _api_collections(kwargs.get("tree", False)),
            "items": lambda: _api_items(kwargs.get("collection"), kwargs.get("limit", 50)),
            "search": lambda: _api_search(kwargs["query"], kwargs.get("limit", 20)),
            "detail": lambda: _api_detail(kwargs["key"]),
            "children": lambda: _api_children(kwargs["key"]),
            "fulltext": lambda: _api_fulltext(kwargs["key"]),
            "pdf-path": lambda: _api_pdf_path(kwargs["key"]),
        },
        "sqlite": {
            "collections": lambda: _sqlite_collections(kwargs.get("tree", False)),
            "items": lambda: _sqlite_items(kwargs.get("collection"), kwargs.get("limit", 50)),
            "search": lambda: _sqlite_search(kwargs["query"], kwargs.get("limit", 20)),
            "detail": lambda: _sqlite_detail(kwargs["key"]),
            "children": lambda: [],  # SQLite doesn't easily support this
            "fulltext": lambda: "",  # No fulltext in SQLite
            "pdf-path": lambda: _sqlite_pdf_path(kwargs["key"]),
        },
        "web_api": {
            "collections": lambda: _web_collections(kwargs.get("tree", False)),
            "items": lambda: _web_items(kwargs.get("collection"), kwargs.get("limit", 50)),
            "search": lambda: _web_search(kwargs["query"], kwargs.get("limit", 20)),
            "detail": lambda: _web_detail(kwargs["key"]),
            "children": lambda: _web_children(kwargs["key"]),
            "fulltext": lambda: "",  # Web API fulltext not directly supported
            "pdf-path": lambda: None,  # No local PDF for web API
        },
    }
    if backend not in handlers or command not in handlers[backend]:
        _json_out("error", message=f"Unsupported: {backend}/{command}")
    return handlers[backend][command]()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    parser = ArgumentParser(description="ZoteroSynth CLI")
    sub = parser.add_subparsers(dest="command")

    # check
    sub.add_parser("check")

    # collections
    p = sub.add_parser("collections")
    p.add_argument("--tree", action="store_true")

    # items
    p = sub.add_parser("items")
    p.add_argument("--collection", default=None)
    p.add_argument("--limit", type=int, default=50)

    # search
    p = sub.add_parser("search")
    p.add_argument("query")
    p.add_argument("--limit", type=int, default=20)

    # detail
    p = sub.add_parser("detail")
    p.add_argument("key")

    # children
    p = sub.add_parser("children")
    p.add_argument("key")

    # fulltext
    p = sub.add_parser("fulltext")
    p.add_argument("key")

    # pdf-path
    p = sub.add_parser("pdf-path")
    p.add_argument("key")

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(1)

    # --- check ---
    if args.command == "check":
        backend = _detect_backend()
        info = {
            "backend": backend,
            "local_api": _detect_local_api(),
            "sqlite_path": str(_find_sqlite()) if _find_sqlite() else None,
            "data_dir": str(_data_dir()) if _data_dir() else None,
            "web_api_configured": bool(os.environ.get("ZOTERO_API_KEY")),
        }
        _json_out(
            "ok" if backend != "none" else "error",
            **info,
            **(
                {}
                if backend != "none"
                else {
                    "message": "No Zotero backend available",
                    "hint": "Start Zotero desktop app, or set ZOTERO_API_KEY + ZOTERO_LIBRARY_ID",
                }
            ),
        )
        return

    # --- other commands ---
    backend = _detect_backend()
    if backend == "none":
        _json_out(
            "error",
            message="No Zotero backend available",
            hint="Start Zotero desktop app, or set ZOTERO_API_KEY + ZOTERO_LIBRARY_ID",
        )

    try:
        kwargs = {}
        if args.command == "collections":
            kwargs["tree"] = args.tree
        elif args.command == "items":
            kwargs["collection"] = args.collection
            kwargs["limit"] = args.limit
        elif args.command == "search":
            kwargs["query"] = args.query
            kwargs["limit"] = args.limit
        elif args.command in ("detail", "children", "fulltext", "pdf-path"):
            kwargs["key"] = args.key

        result = dispatch(backend, args.command, **kwargs)
        _json_out("ok", data=result, backend=backend)
    except Exception as e:
        _json_out("error", message=str(e), backend=backend)


if __name__ == "__main__":
    main()
