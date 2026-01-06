# React & Frontend Syntax Documentation

This document provides a comprehensive reference for all React patterns and syntax used in this project.

## Table of Contents

- [Imports](#imports)
- [Component Structure](#component-structure)
- [State Management](#state-management)
- [Effects & Lifecycle](#effects--lifecycle)
- [Event Handlers](#event-handlers)
- [API Integration](#api-integration)
- [Streaming Responses](#streaming-responses)
- [JSX Patterns](#jsx-patterns)

---

## Imports

### React Core Imports

```typescript
import { useState, useEffect, useRef } from "react";
import "./App.css";
```

**Hooks:**

- `useState`: State management
- `useEffect`: Side effects and lifecycle
- `useRef`: Reference to DOM elements

---

## Component Structure

### Functional Component

```typescript
function App() {
  // State declarations
  // Effects
  // Event handlers
  // Render
  return <div className="app">{/* JSX */}</div>;
}

export default App;
```

### TypeScript Interface for Props/Data

```typescript
interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
}
```

**Type Features:**

- Optional properties with `?`
- Union types for restricted values
- Type safety across component

---

## State Management

### useState Hook

#### String State

```typescript
const [input, setInput] = useState("");
const [currentSessionId, setCurrentSessionId] = useState("default");
```

#### Array State

```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [sessions, setSessions] = useState<string[]>([]);
```

#### Boolean State

```typescript
const [isLoading, setIsLoading] = useState(false);
const [streamingEnabled, setStreamingEnabled] = useState(true);
```

#### Ref for DOM Elements

```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);
```

### Updating State

#### Direct Update

```typescript
setInput("");
setIsLoading(true);
```

#### Functional Update (Previous State)

```typescript
setMessages((prev) => [...prev, userMessage]);
setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
```

**Pattern:**

- Use when new state depends on previous state
- Receives previous state as argument
- Returns new state

#### Array Operations

```typescript
// Add item
setSessions((prev) => [newSessionId, ...prev]);

// Filter/remove items
setSessions((prev) => prev.filter((s) => s !== sessionId));

// Update specific index
setMessages((prev) => {
  const updated = [...prev];
  updated[assistantMessageIndex] = {
    role: "assistant",
    content: assistantMessage,
  };
  return updated;
});
```

---

## Effects & Lifecycle

### useEffect Hook

#### Run Once on Mount

```typescript
useEffect(() => {
  fetchSessions();
}, []);
```

**Empty dependency array `[]`** = runs once after initial render.

#### Run When Dependencies Change

```typescript
useEffect(() => {
  loadHistory(currentSessionId);
}, [currentSessionId]);
```

**Dependency array** = runs when values in array change.

#### Run After Every Render (Messages Update)

```typescript
useEffect(() => {
  scrollToBottom();
}, [messages]);
```

**Pattern:** Auto-scroll when messages change.

### Effect Pattern for Data Fetching

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch("/api/sessions");
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  fetchData();
}, []);
```

---

## Event Handlers

### Form Submit Handler

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim() || isLoading) return;

  // Handle form submission
};
```

**Pattern:**

- Type: `React.FormEvent`
- Prevent default: `e.preventDefault()`
- Guard clauses for validation

### Click Handler

```typescript
const deleteConversation = async (sessionId: string, e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent event bubbling

  // Handle deletion
};
```

**Event Methods:**

- `e.preventDefault()`: Prevent default browser behavior
- `e.stopPropagation()`: Stop event from bubbling up

### Input Change Handler

```typescript
onChange={(e) => setInput(e.target.value)}
onChange={(e) => setStreamingEnabled(e.target.checked)}
```

**Patterns:**

- Text input: `e.target.value`
- Checkbox: `e.target.checked`

### Keyboard Handler

```typescript
onKeyDown={(e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSubmit(e);
  }
}}
```

**Pattern:**

- Check specific key with `e.key`
- Check modifiers: `e.shiftKey`, `e.ctrlKey`, etc.

---

## API Integration

### Fetch API - GET Request

```typescript
const response = await fetch("/api/sessions");
const data = await response.json();
setSessions(data.sessions || []);
```

### Fetch API - POST Request

```typescript
await fetch("/api/sessions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ sessionId: newSessionId }),
});
```

**Components:**

- `method`: HTTP method
- `headers`: Request headers object
- `body`: JSON stringified data

### Fetch API - DELETE Request

```typescript
await fetch(`/api/sessions/${sessionId}`, {
  method: "DELETE",
});
```

### Error Handling Pattern

```typescript
try {
  const response = await fetch("/api/chat", {
    /* ... */
  });
  const data = await response.json();
  // Process data
} catch (error) {
  console.error("Error sending message:", error);
  // Handle error state
} finally {
  setIsLoading(false);
}
```

---

## Streaming Responses

### Reading Stream with ReadableStream API

```typescript
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message,
    sessionId: currentSessionId,
    streaming: true,
  }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

if (!reader) {
  throw new Error("No reader available");
}
```

### Processing Stream Chunks

```typescript
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split("\n");

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = JSON.parse(line.slice(6));

      if (data.done) break;

      if (data.content) {
        assistantMessage += data.content;
        // Update state with accumulated message
      }
    }
  }
}
```

**Pattern:**

1. Get reader from response body
2. Create TextDecoder for byte-to-string conversion
3. Loop until done
4. Decode chunks and parse SSE format
5. Update UI in real-time

---

## JSX Patterns

### Conditional Rendering

#### If-Else with Ternary

```typescript
{
  messages.length === 0 ? (
    <div className="empty-state">
      <h2>👋 Welcome!</h2>
    </div>
  ) : (
    messages.map((message, index) => <div key={index}>{message.content}</div>)
  );
}
```

#### Conditional with && (Short Circuit)

```typescript
{
  isLoading && !streamingEnabled && (
    <div className="loading">
      <span>Assistant is thinking</span>
    </div>
  );
}
```

### Mapping Arrays to Elements

```typescript
{
  messages.map((message, index) => (
    <div key={index} className={`message ${message.role}`}>
      <div className="message-role">
        {message.role === "user" ? "You" : "Assistant"}
      </div>
      <div className="message-content">{message.content}</div>
    </div>
  ));
}
```

**Important:**

- Always provide `key` prop for list items
- Use template literals for dynamic classes

### Event Binding in JSX

```typescript
<button onClick={createNewSession}>New Chat</button>

<button onClick={(e) => deleteConversation(sessionId, e)}>
  🗑️
</button>

<form onSubmit={handleSubmit}>
  {/* form content */}
</form>
```

### Form Elements

#### Input Field

```typescript
<textarea
  className="message-input"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }}
  placeholder="Type your message here..."
  disabled={isLoading}
/>
```

**Controlled Component Pattern:**

- `value={input}`: Controlled by state
- `onChange`: Updates state
- Creates single source of truth

#### Checkbox

```typescript
<input
  type="checkbox"
  checked={streamingEnabled}
  onChange={(e) => setStreamingEnabled(e.target.checked)}
/>
```

#### Button

```typescript
<button
  type="submit"
  className="send-button"
  disabled={isLoading || !input.trim()}
>
  Send
</button>
```

### Dynamic Classes

```typescript
className={`session-item ${
  sessionId === currentSessionId ? "active" : ""
}`}
```

**Pattern:** Template literals for conditional classes.

### Refs in JSX

```typescript
<div ref={messagesEndRef} />
```

Used with `useRef` for direct DOM access (e.g., scrolling).

---

## Optimistic UI Updates

### Pattern: Update UI Before API Call

```typescript
// 1. Optimistically update UI
setSessions((prev) => [newSessionId, ...prev]);

try {
  // 2. Make API call
  await fetch("/api/sessions", {
    /* ... */
  });
} catch (error) {
  // 3. Revert on error
  setSessions((prev) => prev.filter((s) => s !== newSessionId));
}
```

**Benefits:**

- Immediate UI feedback
- Better user experience
- Gracefully handle errors

---

## DOM Manipulation

### Scrolling with useRef

```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

// In JSX
<div ref={messagesEndRef} />;
```

**Pattern:**

- Create ref with `useRef`
- Attach to DOM element with `ref` attribute
- Access DOM node via `.current`
- Use optional chaining `?.` for safety

---

## Key Concepts

### Controlled Components

Input values controlled by React state:

```typescript
<input value={input} onChange={(e) => setInput(e.target.value)} />
```

### Immutable State Updates

Never mutate state directly:

```typescript
// ❌ Wrong
messages.push(newMessage);

// ✅ Correct
setMessages((prev) => [...prev, newMessage]);
```

### Async Operations in Effects

```typescript
useEffect(() => {
  const fetchData = async () => {
    // async code
  };
  fetchData();
}, []);
```

### Type Safety with TypeScript

```typescript
const [messages, setMessages] = useState<Message[]>([]);
```

---

## Dependencies

### Required Packages

```json
{
  "react": "^19.2.3",
  "react-dom": "^19.2.3"
}
```

### Dev Dependencies

```json
{
  "@types/react": "^19.2.7",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^5.1.2",
  "vite": "^7.3.0"
}
```

---

_Last Updated: January 6, 2026_
