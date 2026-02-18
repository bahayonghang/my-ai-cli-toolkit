---
title: Obsidian CLI (obsidian-rest-api)
description: Control Obsidian from the command line or scripts using the Local REST API plugin. Create notes, append content, list files, and search your vault programmatically.
category: obsidian
tags: [cli, automation, api, notes]
---

# Obsidian CLI

Control your Obsidian vault programmatically using the Local REST API. This skill allows agents to read, write, and modify notes directly within a running Obsidian instance.

> **Requirement**: The [Local REST API](https://github.com/coddingtonbear/obsidian-local-rest-api) plugin must be installed and enabled in Obsidian.

## Core Capabilities

### 1. File Management
- **GET** `/vault/<path>`: Read file content
- **PUT** `/vault/<path>`: Create or overwrite file
- **POST** `/vault/<path>`: Update file content
- **DELETE** `/vault/<path>`: Delete file
- **GET** `/vault/`: List files in root or folder

### 2. Search
- **simple-search**: fast text search
- **search**: complex search using Obsidian's search syntax

### 3. Active Note
- **GET** `/active/`: Get currently open note
- **PUT** `/active/`: Update currently open note

### 4. Commands
- Trigger Obsidian commands via `/commands/` endpoint

## Common Usage

### Create a new note
```bash
curl -X PUT "https://127.0.0.1:27123/vault/New%20Note.md" \
     -H "Authorization: Bearer <your-token>" \
     -d "# New Note Content"
```

### Append to a daily note
```bash
curl -X POST "https://127.0.0.1:27123/vault/Daily/2023-10-27.md" \
     -H "Authorization: Bearer <your-token>" \
     -d "\n- [ ] New task added by agent"
```

### Search vault
```bash
curl "https://127.0.0.1:27123/search/simple?q=project" \
     -H "Authorization: Bearer <your-token>"
```

## Agent Integration

This skill provides a bridge for agents to:
1.  **Read context** from your current notes.
2.  **Save research** directly to your vault.
3.  **Update task lists** based on conversation.
4.  **Organize information** into new folders and files.

## Configuration

Ensure your `~/.gemini/config.json` or environment variables are set with the correct:
- `OBSIDIAN_API_KEY`: Your Local REST API token
- `OBSIDIAN_API_URL`: Usually `https://127.0.0.1:27123` (default)
