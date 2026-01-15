#!/usr/bin/env python3
"""
Claude-Mem: Persistent memory compression system built for Claude Code.

This module implements a Python version of the Claude-Mem system that
seamlessly preserves context across Claude Code sessions by automatically
capturing tool usage observations, generating semantic summaries, and
making them available to future sessions.
"""

import json
import os
import sqlite3
import threading
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ClaudeMem:
    """
    Main Claude-Mem class that manages persistent memory for Claude Code sessions.
    
    This class provides functionality to:
    - Store and retrieve session observations
    - Generate semantic summaries
    - Maintain context across sessions
    - Provide search capabilities for historical data
    """
    
    def __init__(self, data_dir: Optional[str] = None):
        """
        Initialize Claude-Mem with a data directory.
        
        Args:
            data_dir: Directory to store memory data. Defaults to ~/.claude-mem
        """
        self.data_dir = Path(data_dir) if data_dir else Path.home() / ".claude-mem"
        self.db_path = self.data_dir / "memory.db"
        self.lock = threading.Lock()
        
        # Create data directory if it doesn't exist
        self.data_dir.mkdir(exist_ok=True)
        
        # Initialize the database
        self._init_database()
        
    def _init_database(self):
        """Initialize the SQLite database with required tables."""
        self.conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        
        # Enable WAL mode for better concurrency
        self.conn.execute("PRAGMA journal_mode=WAL")
        self.conn.execute("PRAGMA synchronous=NORMAL")
        self.conn.execute("PRAGMA foreign_keys=ON")
        
        # Create tables
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_session_id TEXT UNIQUE NOT NULL,
                memory_session_id TEXT UNIQUE,
                project TEXT NOT NULL,
                user_prompt TEXT,
                started_at TIMESTAMP NOT NULL,
                completed_at TIMESTAMP,
                status TEXT CHECK(status IN ('active', 'completed', 'failed')) NOT NULL DEFAULT 'active'
            )
        """)
        
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS observations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                memory_session_id TEXT NOT NULL,
                project TEXT NOT NULL,
                text TEXT,
                type TEXT NOT NULL CHECK(type IN ('decision', 'bugfix', 'feature', 'refactor', 'discovery', 'change')),
                title TEXT,
                subtitle TEXT,
                facts TEXT,
                narrative TEXT,
                concepts TEXT,
                files_read TEXT,
                files_modified TEXT,
                prompt_number INTEGER,
                created_at TIMESTAMP NOT NULL,
                FOREIGN KEY(memory_session_id) REFERENCES sessions(memory_session_id) ON DELETE CASCADE
            )
        """)
        
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS session_summaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                memory_session_id TEXT UNIQUE NOT NULL,
                project TEXT NOT NULL,
                request TEXT,
                investigated TEXT,
                learned TEXT,
                completed TEXT,
                next_steps TEXT,
                files_read TEXT,
                files_edited TEXT,
                notes TEXT,
                created_at TIMESTAMP NOT NULL,
                FOREIGN KEY(memory_session_id) REFERENCES sessions(memory_session_id) ON DELETE CASCADE
            )
        """)
        
        # Create indexes for better performance
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_content_id ON sessions(content_session_id)")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_memory_id ON sessions(memory_session_id)")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project)")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status)")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_observations_session ON observations(memory_session_id)")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_observations_project ON observations(project)")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_observations_type ON observations(type)")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_summaries_session ON session_summaries(memory_session_id)")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_summaries_project ON session_summaries(project)")
        
        self.conn.commit()
        
    def create_session(self, content_session_id: str, project: str, user_prompt: Optional[str] = None) -> int:
        """
        Create a new session record.
        
        Args:
            content_session_id: The Claude session ID
            project: The project name
            user_prompt: The initial user prompt
            
        Returns:
            The session ID
        """
        with self.lock:
            cursor = self.conn.cursor()
            cursor.execute("""
                INSERT INTO sessions (content_session_id, project, user_prompt, started_at)
                VALUES (?, ?, ?, ?)
            """, (content_session_id, project, user_prompt, datetime.now()))
            
            session_id = cursor.lastrowid
            self.conn.commit()
            logger.info(f"Created session {session_id} for project '{project}'")
            return session_id
    
    def add_observation(self, memory_session_id: str, project: str, text: Optional[str] = None, 
                       obs_type: str = "discovery", title: Optional[str] = None, 
                       subtitle: Optional[str] = None, facts: Optional[str] = None,
                       narrative: Optional[str] = None, concepts: Optional[str] = None,
                       files_read: Optional[str] = None, files_modified: Optional[str] = None,
                       prompt_number: Optional[int] = None) -> int:
        """
        Add an observation to a session.
        
        Args:
            memory_session_id: The memory session ID
            project: The project name
            text: The observation text (deprecated in favor of structured fields)
            obs_type: The type of observation ('decision', 'bugfix', 'feature', etc.)
            title: The observation title
            subtitle: The observation subtitle
            facts: Key facts from the observation
            narrative: A narrative description
            concepts: Key concepts learned
            files_read: Files that were read
            files_modified: Files that were modified
            prompt_number: The prompt number this observation corresponds to
            
        Returns:
            The observation ID
        """
        with self.lock:
            cursor = self.conn.cursor()
            cursor.execute("""
                INSERT INTO observations (
                    memory_session_id, project, text, type, title, subtitle, facts,
                    narrative, concepts, files_read, files_modified, prompt_number, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                memory_session_id, project, text, obs_type, title, subtitle, facts,
                narrative, concepts, files_read, files_modified, prompt_number, datetime.now()
            ))
            
            obs_id = cursor.lastrowid
            self.conn.commit()
            logger.info(f"Added observation {obs_id} to session '{memory_session_id}'")
            return obs_id
    
    def add_summary(self, memory_session_id: str, project: str, request: Optional[str] = None,
                   investigated: Optional[str] = None, learned: Optional[str] = None,
                   completed: Optional[str] = None, next_steps: Optional[str] = None,
                   files_read: Optional[str] = None, files_edited: Optional[str] = None,
                   notes: Optional[str] = None) -> int:
        """
        Add a session summary.
        
        Args:
            memory_session_id: The memory session ID
            project: The project name
            request: The original request
            investigated: What was investigated
            learned: What was learned
            completed: What was completed
            next_steps: What should happen next
            files_read: Files that were read during the session
            files_edited: Files that were edited during the session
            notes: Additional notes
            
        Returns:
            The summary ID
        """
        with self.lock:
            cursor = self.conn.cursor()
            cursor.execute("""
                INSERT INTO session_summaries (
                    memory_session_id, project, request, investigated, learned,
                    completed, next_steps, files_read, files_edited, notes, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                memory_session_id, project, request, investigated, learned,
                completed, next_steps, files_read, files_edited, notes, datetime.now()
            ))
            
            summary_id = cursor.lastrowid
            self.conn.commit()
            logger.info(f"Added summary for session '{memory_session_id}'")
            return summary_id
    
    def get_session_by_content_id(self, content_session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a session by its content session ID.
        
        Args:
            content_session_id: The Claude session ID
            
        Returns:
            Session data or None if not found
        """
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM sessions WHERE content_session_id = ?", (content_session_id,))
        row = cursor.fetchone()
        
        if row:
            columns = [description[0] for description in cursor.description]
            return dict(zip(columns, row))
        return None
    
    def get_session_by_memory_id(self, memory_session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a session by its memory session ID.
        
        Args:
            memory_session_id: The memory session ID
            
        Returns:
            Session data or None if not found
        """
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM sessions WHERE memory_session_id = ?", (memory_session_id,))
        row = cursor.fetchone()
        
        if row:
            columns = [description[0] for description in cursor.description]
            return dict(zip(columns, row))
        return None
    
    def get_observations_for_session(self, memory_session_id: str) -> List[Dict[str, Any]]:
        """
        Get all observations for a session.
        
        Args:
            memory_session_id: The memory session ID
            
        Returns:
            List of observations
        """
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT * FROM observations 
            WHERE memory_session_id = ?
            ORDER BY created_at DESC
        """, (memory_session_id,))
        
        rows = cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        return [dict(zip(columns, row)) for row in rows]
    
    def get_summary_for_session(self, memory_session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the summary for a session.
        
        Args:
            memory_session_id: The memory session ID
            
        Returns:
            Summary data or None if not found
        """
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM session_summaries WHERE memory_session_id = ?", (memory_session_id,))
        row = cursor.fetchone()
        
        if row:
            columns = [description[0] for description in cursor.description]
            return dict(zip(columns, row))
        return None
    
    def search_observations(self, query: str, project: Optional[str] = None, 
                           obs_type: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search observations by text content.
        
        Args:
            query: Search query text
            project: Optional project filter
            obs_type: Optional observation type filter
            limit: Maximum number of results
            
        Returns:
            List of matching observations
        """
        cursor = self.conn.cursor()
        
        # Build the query dynamically based on provided filters
        sql = """
            SELECT * FROM observations 
            WHERE (text LIKE ? OR title LIKE ? OR subtitle LIKE ? OR facts LIKE ? 
                   OR narrative LIKE ? OR concepts LIKE ?)
        """
        params = [f'%{query}%', f'%{query}%', f'%{query}%', f'%{query}%', f'%{query}%', f'%{query}%']
        
        if project:
            sql += " AND project = ?"
            params.append(project)
            
        if obs_type:
            sql += " AND type = ?"
            params.append(obs_type)
            
        sql += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        return [dict(zip(columns, row)) for row in rows]
    
    def search_sessions(self, project: Optional[str] = None, status: Optional[str] = None, 
                      limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search sessions by criteria.
        
        Args:
            project: Optional project filter
            status: Optional status filter
            limit: Maximum number of results
            
        Returns:
            List of matching sessions
        """
        cursor = self.conn.cursor()
        
        sql = "SELECT * FROM sessions WHERE 1=1"
        params = []
        
        if project:
            sql += " AND project = ?"
            params.append(project)
            
        if status:
            sql += " AND status = ?"
            params.append(status)
            
        sql += " ORDER BY started_at DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        return [dict(zip(columns, row)) for row in rows]
    
    def update_session_status(self, memory_session_id: str, status: str):
        """
        Update the status of a session.
        
        Args:
            memory_session_id: The memory session ID
            status: New status ('active', 'completed', 'failed')
        """
        with self.lock:
            cursor = self.conn.cursor()
            cursor.execute("UPDATE sessions SET status = ?, completed_at = ? WHERE memory_session_id = ?",
                          (status, datetime.now() if status == 'completed' else None, memory_session_id))
            self.conn.commit()
            logger.info(f"Updated session '{memory_session_id}' status to '{status}'")
    
    def close(self):
        """Close the database connection."""
        if hasattr(self, 'conn'):
            self.conn.close()


class ClaudeMemContextBuilder:
    """
    Builds context for Claude sessions based on historical data.
    
    This class compiles relevant observations and summaries to provide
    contextual information for new Claude sessions.
    """
    
    def __init__(self, claude_mem: ClaudeMem):
        """
        Initialize the context builder.
        
        Args:
            claude_mem: ClaudeMem instance to retrieve data from
        """
        self.claude_mem = claude_mem
    
    def build_context(self, project: str, max_observations: int = 10, 
                     include_summaries: bool = True) -> str:
        """
        Build context for a project based on historical data.
        
        Args:
            project: The project to build context for
            max_observations: Maximum number of observations to include
            include_summaries: Whether to include session summaries
            
        Returns:
            Context string to be provided to Claude
        """
        context_parts = []
        
        # Add project header
        context_parts.append(f"# Project Context: {project}\n")
        
        # Add recent observations
        recent_sessions = self.claude_mem.search_sessions(project=project, limit=5)
        
        if recent_sessions:
            context_parts.append("## Recent Sessions:\n")
            for session in recent_sessions:
                context_parts.append(f"- Session {session['id']} ({session['status']}) started at {session['started_at']}")
                
                # Add observations for this session
                observations = self.claude_mem.get_observations_for_session(session['memory_session_id'])
                
                if observations:
                    context_parts.append("  - Observations:")
                    for obs in observations[:max_observations]:
                        obs_text = obs.get('text') or obs.get('narrative') or obs.get('title', 'No description')
                        context_parts.append(f"    * [{obs['type']}] {obs_text}")
        
        # Add summaries if requested
        if include_summaries:
            context_parts.append("\n## Session Summaries:\n")
            for session in recent_sessions:
                summary = self.claude_mem.get_summary_for_session(session['memory_session_id'])
                if summary:
                    context_parts.append(f"### Summary for Session {session['id']}:")
                    if summary.get('request'):
                        context_parts.append(f"- Request: {summary['request']}")
                    if summary.get('investigated'):
                        context_parts.append(f"- Investigated: {summary['investigated']}")
                    if summary.get('learned'):
                        context_parts.append(f"- Learned: {summary['learned']}")
                    if summary.get('completed'):
                        context_parts.append(f"- Completed: {summary['completed']}")
                    if summary.get('next_steps'):
                        context_parts.append(f"- Next Steps: {summary['next_steps']}")
                    context_parts.append("")
        
        return "\n".join(context_parts)


# Example usage and testing
if __name__ == "__main__":
    # Initialize Claude-Mem
    cm = ClaudeMem()
    
    # Create a sample session
    session_id = cm.create_session(
        content_session_id="test-session-123",
        project="my-awesome-project",
        user_prompt="Help me implement a new feature"
    )
    
    # Add some observations
    cm.add_observation(
        memory_session_id=session_id,
        project="my-awesome-project",
        title="Database Schema Design",
        subtitle="Designing the user table",
        narrative="Discussed the optimal schema for the user table including indexing strategies",
        obs_type="design",
        concepts="database design, indexing, normalization",
        files_read="models/user.py, migrations/001.sql"
    )
    
    cm.add_observation(
        memory_session_id=session_id,
        project="my-awesome-project",
        title="Authentication Implementation",
        subtitle="JWT token handling",
        narrative="Implemented JWT token creation and validation for user authentication",
        obs_type="feature",
        concepts="JWT, authentication, security",
        files_modified="auth/jwt_handler.py, controllers/auth.py"
    )
    
    # Add a summary
    cm.add_summary(
        memory_session_id=session_id,
        project="my-awesome-project",
        request="Implement user authentication system",
        investigated="Different authentication methods, JWT vs session-based",
        learned="JWT is better for our microservice architecture",
        completed="Basic JWT authentication with refresh tokens",
        next_steps="Add password reset functionality and improve error handling",
        files_edited="auth/jwt_handler.py, controllers/auth.py, models/user.py"
    )
    
    # Update session status
    cm.update_session_status(session_id, "completed")
    
    # Search for observations
    results = cm.search_observations("authentication", project="my-awesome-project")
    print(f"Found {len(results)} authentication-related observations")
    
    # Build context for a new session
    context_builder = ClaudeMemContextBuilder(cm)
    context = context_builder.build_context("my-awesome-project")
    print("\nGenerated Context:")
    print(context)
    
    # Clean up
    cm.close()