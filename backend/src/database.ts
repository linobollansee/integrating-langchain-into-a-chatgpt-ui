import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

export interface Message {
  id?: number;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function initDatabase(): Promise<void> {
  db = await open({
    filename: "./chat.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_session_id ON messages(session_id);
  `);

  console.log("Database initialized successfully");
}

export async function saveMessage(message: Message): Promise<Message> {
  if (!db) throw new Error("Database not initialized");

  const result = await db.run(
    "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
    [message.session_id, message.role, message.content]
  );

  return {
    ...message,
    id: result.lastID,
  };
}

export async function getConversationHistory(
  sessionId: string
): Promise<Message[]> {
  if (!db) throw new Error("Database not initialized");

  const messages = await db.all<Message[]>(
    "SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC",
    [sessionId]
  );

  return messages;
}

export async function getAllSessions(): Promise<string[]> {
  if (!db) throw new Error("Database not initialized");

  const sessions = await db.all<{ session_id: string }[]>(
    "SELECT DISTINCT session_id FROM messages GROUP BY session_id ORDER BY session_id DESC"
  );

  return sessions.map((s) => s.session_id);
}

export async function deleteSession(sessionId: string): Promise<void> {
  if (!db) throw new Error("Database not initialized");

  await db.run("DELETE FROM messages WHERE session_id = ?", [sessionId]);
}

export async function createSession(sessionId: string): Promise<void> {
  if (!db) throw new Error("Database not initialized");

  // Insert a placeholder message to mark the session as existing
  await db.run(
    "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
    [sessionId, "assistant", ""]
  );
}
