import argparse
import json
import os
import shutil
import sqlite3
import sys

# Default Zotero DB path (Windows)
DEFAULT_DB_PATH = os.path.expanduser(r"~\Zotero\zotero.sqlite")
TEMP_DB_PATH = "temp_zotero_extract.sqlite"


def get_db_connection(db_path):
    """Creates a temporary copy of the DB to avoid locking and returns a connection."""
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at {db_path}")
        sys.exit(1)

    shutil.copy2(db_path, TEMP_DB_PATH)
    return sqlite3.connect(TEMP_DB_PATH)


def fetch_items(conn, search_query=None, collection_name=None, limit=None):
    """
    Fetches items based on search query or collection name.
    """
    cursor = conn.cursor()

    # Base query structure to get Item IDs
    params = []
    where_clauses = ["i.itemTypeID NOT IN (SELECT itemTypeID FROM itemTypes WHERE typeName IN ('attachment', 'note'))"]

    if collection_name:
        # Find collection ID
        cursor.execute("SELECT collectionID FROM collections WHERE collectionName LIKE ?", (f"%{collection_name}%",))
        col_res = cursor.fetchone()
        if not col_res:
            print(f"Collection '{collection_name}' not found.")
            return []

        col_id = col_res[0]
        # Recursive collection search is complex in SQlite without recursive CTEs easily available or known schema depth
        # For now, just direct children items
        where_clauses.append("i.itemID IN (SELECT itemID FROM collectionItems WHERE collectionID = ?)")
        params.append(col_id)

    if search_query:
        # Simple search in Title or Abstract
        # We need to join itemData and itemDataValues
        # This is a bit complex in SQL, simpler to use Zotero's FTS if available, but let's stick to simple LIKE
        # Optimized: Fetch items where title or abstract matches

        search_term = f"%{search_query}%"
        # Subquery to find itemIDs that have matching title or abstract or other fields
        search_sql = """
            i.itemID IN (
                SELECT id.itemID FROM itemData id
                JOIN itemDataValues idv ON id.valueID = idv.valueID
                WHERE idv.value LIKE ?
            )
        """
        where_clauses.append(search_sql)
        params.append(search_term)

    where_str = " AND ".join(where_clauses)

    limit_clause = ""
    if limit:
        limit_clause = f"LIMIT {limit}"

    sql = f"""
    SELECT DISTINCT i.itemID, i.key, it.typeName
    FROM items i
    JOIN itemTypes it ON i.itemTypeID = it.itemTypeID
    WHERE {where_str}
    ORDER BY i.dateModified DESC
    {limit_clause}
    """

    cursor.execute(sql, params)
    return cursor.fetchall()


def get_item_metadata(conn, item_id, item_key, item_type):
    """
    Retrieves detailed metadata for a single item.
    """
    cursor = conn.cursor()

    # Helper to get field value
    def get_field(field_name):
        query = """
        SELECT iv.value
        FROM itemData id
        JOIN itemDataValues iv ON id.valueID = iv.valueID
        JOIN fields f ON id.fieldID = f.fieldID
        WHERE id.itemID = ? AND f.fieldName = ?
        """
        cursor.execute(query, (item_id, field_name))
        res = cursor.fetchone()
        return res[0] if res else ""

    title = get_field("title")
    date = get_field("date")
    abstract = get_field("abstractNote")
    publication = get_field("publicationTitle") or get_field("proceedingsTitle") or get_field("conferenceName") or ""
    url = get_field("url")

    # Creators (Authors)
    cursor.execute(
        """
        SELECT c.firstName, c.lastName
        FROM itemCreators ic
        JOIN creators c ON ic.creatorID = c.creatorID
        WHERE ic.itemID = ?
        ORDER BY ic.orderIndex
    """,
        (item_id,),
    )
    creators = cursor.fetchall()
    authors = [f"{c[1]} {c[0]}" if c[0] else c[1] for c in creators]

    # Year
    year = date[:4] if date and len(date) >= 4 else "n.d."

    # Zotero Select Link
    # zotero://select/library/items/<KEY>
    item_link = f"zotero://select/library/items/{item_key}"

    return {
        "key": item_key,
        "title": title,
        "itemType": item_type,
        "year": year,
        "date": date,
        "authors": authors,
        "publicationTitle": publication,
        "itemLink": item_link,
        "url": url,
        "abstract": abstract,
    }


def main():
    parser = argparse.ArgumentParser(description="Extract papers from Zotero local database.")
    parser.add_argument("--db", default=DEFAULT_DB_PATH, help="Path to zotero.sqlite")
    parser.add_argument("--query", help="Search term (title/abstract)")
    parser.add_argument("--collection", help="Collection name to filter by")
    parser.add_argument("--limit", type=int, default=100, help="Max items to return")
    parser.add_argument("--output", default="zotero_extract.json", help="Output JSON file")

    args = parser.parse_args()

    try:
        conn = get_db_connection(args.db)
    except Exception as e:
        print(f"Failed to connect to DB: {e}")
        return

    try:
        print(f"Searching Zotero DB (Limit: {args.limit})...")
        items = fetch_items(conn, args.query, args.collection, args.limit)
        print(f"Found {len(items)} items.")

        results = {}
        for item_id, item_key, item_type in items:
            meta = get_item_metadata(conn, item_id, item_key, item_type)
            results[item_key] = meta

        # Add summary metadata as requested
        final_output = {
            "summary": {"count": len(results), "dataSource": "Local Zotero Database", "dataSource url": args.db},
            "items": results,
        }

        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(final_output, f, indent=2, ensure_ascii=False)

        print(f"Exported {len(results)} items to {args.output}")

    finally:
        conn.close()
        if os.path.exists(TEMP_DB_PATH):
            try:
                os.remove(TEMP_DB_PATH)
            except OSError:
                pass


if __name__ == "__main__":
    main()
