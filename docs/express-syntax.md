# Express Server Syntax Documentation

This document provides a comprehensive reference for all Express.js server patterns and syntax used in this project.

## Table of Contents

- [Imports](#imports)
- [Server Initialization](#server-initialization)
- [Middleware](#middleware)
- [Route Handlers](#route-handlers)
- [Request/Response Objects](#requestresponse-objects)
- [Error Handling](#error-handling)
- [Server-Sent Events (SSE)](#server-sent-events-sse)

---

## Imports

### Core Express Imports

```typescript
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
```

**Packages:**

- `express`: Main Express framework
- `Request, Response`: TypeScript types for HTTP objects
- `cors`: Cross-Origin Resource Sharing middleware
- `dotenv`: Environment variable loader

---

## Server Initialization

### Creating Express App

```typescript
const app = express();
const PORT = process.env.PORT || 3001;
```

### Environment Configuration

```typescript
dotenv.config();
```

Loads environment variables from `.env` file.

### Starting the Server

```typescript
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**Parameters:**

- `PORT`: Port number to listen on
- Callback function executed when server starts

---

## Middleware

### CORS Configuration

```typescript
app.use(cors());
```

**Purpose:** Enables Cross-Origin Resource Sharing for frontend requests.

### JSON Body Parser

```typescript
app.use(express.json());
```

**Purpose:** Automatically parses incoming JSON request bodies.

### Middleware Execution Order

Middleware is applied in the order it's declared:

1. CORS
2. JSON parser
3. Route handlers

---

## Route Handlers

### POST Route

```typescript
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message, sessionId = "default" } = req.body;
    // Handle request
    res.json({ message: "response" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
```

**Pattern:**

- Path: `/api/chat`
- Handler: Async function with `Request` and `Response`
- Type annotations for TypeScript safety

### GET Route with Parameters

```typescript
app.get("/api/history/:sessionId", async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  // Use sessionId
});
```

**URL Parameters:**

- `:sessionId` in route creates `req.params.sessionId`
- Accessible via `req.params`

### GET Route (Simple)

```typescript
app.get("/api/sessions", async (req: Request, res: Response) => {
  const sessions = await getAllSessions();
  res.json({ sessions });
});
```

### DELETE Route

```typescript
app.delete("/api/sessions/:sessionId", async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  await deleteSession(sessionId);
  res.json({ success: true });
});
```

---

## Request/Response Objects

### Request Body (`req.body`)

```typescript
const { message, sessionId = "default" } = req.body;
```

**Access POST data:**

- Destructuring with default values
- Requires `express.json()` middleware

### Request Parameters (`req.params`)

```typescript
const { sessionId } = req.params;
```

**Access URL parameters:**

- Defined in route with `:paramName`

### Request Query (`req.query`)

```typescript
const streaming = req.body.streaming === true;
```

**Checking boolean values:**

- Explicit comparison for type safety

### Response Methods

#### Send JSON

```typescript
res.json({ message: "response" });
```

#### Set Status Code

```typescript
res.status(400).json({ error: "Message is required" });
res.status(500).json({ error: "Internal server error" });
```

**Common Status Codes:**

- `200`: Success (default for `res.json()`)
- `400`: Bad Request (client error)
- `500`: Internal Server Error

#### Early Return

```typescript
if (!message) {
  return res.status(400).json({ error: "Message is required" });
}
```

**Note:** Use `return` to prevent further code execution.

---

## Server-Sent Events (SSE)

### Setting SSE Headers

```typescript
res.setHeader("Content-Type", "text/event-stream");
res.setHeader("Cache-Control", "no-cache");
res.setHeader("Connection", "keep-alive");
```

**Required Headers:**

- `Content-Type`: Must be `text/event-stream`
- `Cache-Control`: Prevents caching
- `Connection`: Keeps connection open

### Writing SSE Data

```typescript
res.write(`data: ${JSON.stringify({ content })}\n\n`);
```

**Format:**

- Prefix with `data: `
- JSON stringify the payload
- End with double newline `\n\n`

### Completing SSE Stream

```typescript
res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
res.end();
```

**Pattern:**

1. Send final message with `done: true`
2. Call `res.end()` to close connection

### SSE Complete Example

```typescript
if (streaming) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`);
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
}
```

---

## Error Handling

### Try-Catch Pattern

```typescript
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    // Route logic
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

**Best Practices:**

- Wrap all async operations in try-catch
- Log errors for debugging
- Return appropriate status codes

### Validation Errors

```typescript
if (!message) {
  return res.status(400).json({ error: "Message is required" });
}
```

**Pattern:**

- Check for required fields
- Return 400 Bad Request for validation failures
- Use descriptive error messages

---

## Complete Server Setup

### Initialization Flow

```typescript
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
```

**Pattern:**

1. Initialize dependencies (database)
2. Start listening on port
3. Handle startup errors
4. Exit with error code on failure

---

## Route Organization

### Endpoint Structure

```
POST   /api/chat              - Send message, get response
GET    /api/history/:sessionId - Get conversation history
GET    /api/sessions          - Get all sessions
POST   /api/sessions          - Create new session
DELETE /api/sessions/:sessionId - Delete session
GET    /api/health            - Health check
```

---

## Key Concepts

### Async Route Handlers

All database operations require `async/await`:

```typescript
app.post("/api/chat", async (req: Request, res: Response) => {
  const result = await someAsyncOperation();
});
```

### TypeScript Type Safety

```typescript
const { message, sessionId = "default" } = req.body;
```

Use destructuring with TypeScript for type inference.

### Streaming vs Non-Streaming

```typescript
if (streaming) {
  // SSE streaming response
} else {
  // Single JSON response
}
```

Different response patterns for different client needs.

---

## Dependencies

### Required Packages

```json
{
  "express": "^5.2.1",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3"
}
```

### Dev Dependencies

```json
{
  "@types/express": "^5.0.6",
  "@types/cors": "^2.8.17"
}
```

---

_Last Updated: January 6, 2026_
