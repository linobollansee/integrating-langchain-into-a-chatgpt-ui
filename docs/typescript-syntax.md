# TypeScript Syntax Documentation

This document provides a comprehensive reference for all TypeScript patterns and syntax used in this project.

## Table of Contents

- [Type Annotations](#type-annotations)
- [Interfaces](#interfaces)
- [Function Types](#function-types)
- [Generics](#generics)
- [Union Types](#union-types)
- [Optional Properties](#optional-properties)
- [Type Assertions](#type-assertions)
- [Utility Types](#utility-types)

---

## Type Annotations

### Variable Type Annotations

```typescript
const PORT: number = 3001;
const message: string = "Hello";
const isLoading: boolean = false;
```

### Array Types

```typescript
const messages: Message[] = [];
const sessions: string[] = [];
```

**Alternative Syntax:**

```typescript
const messages: Array<Message> = [];
```

### Object Types

```typescript
const db: Database<sqlite3.Database, sqlite3.Statement> | null = null;
```

---

## Interfaces

### Basic Interface

```typescript
export interface Message {
  id?: number;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}
```

**Features:**

- `export`: Makes interface available to other modules
- Optional properties with `?`
- Union types for restricted values

### Interface Usage

```typescript
const userMessage: Message = {
  role: "user",
  content: input.trim(),
};
```

### Inline Object Type

```typescript
const sessions: { session_id: string }[] = await db.all(...);
```

---

## Function Types

### Function Declaration with Types

```typescript
async function initDatabase(): Promise<void> {
  // Implementation
}
```

**Components:**

- Return type: `Promise<void>`
- `async` returns Promise automatically
- `void` means no return value

### Function with Parameters

```typescript
async function saveMessage(message: Message): Promise<Message> {
  // Implementation
  return savedMessage;
}
```

**Pattern:**

- Parameter type: `message: Message`
- Return type: `Promise<Message>`

### Arrow Function Types

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // Implementation
};
```

### Callback Function Types

```typescript
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Event Handler Types

```typescript
const deleteConversation = async (sessionId: string, e: React.MouseEvent) => {
  // Implementation
};
```

**React Event Types:**

- `React.FormEvent` - Form submissions
- `React.MouseEvent` - Click events
- `React.ChangeEvent` - Input changes
- `React.KeyboardEvent` - Keyboard events

---

## Generics

### Generic Type Parameters

```typescript
const messages = await db.all<Message[]>(
  "SELECT * FROM messages WHERE session_id = ?",
  [sessionId]
);
```

**Pattern:**

- Angle brackets: `<Message[]>`
- Provides type information to function
- Return value is typed as `Message[]`

### Generic with Custom Type

```typescript
const sessions = await db.all<{ session_id: string }[]>(
  "SELECT DISTINCT session_id FROM messages"
);
```

### useState with Generics

```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [sessions, setSessions] = useState<string[]>([]);
```

**Pattern:**

- Specify state type: `useState<Type>`
- Initial value must match type
- State setter is automatically typed

### useRef with Generics

```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);
```

**Pattern:**

- Specify element type: `useRef<HTMLDivElement>`
- Initialize with `null`
- `.current` is typed as `HTMLDivElement | null`

---

## Union Types

### String Literal Union

```typescript
role: "user" | "assistant";
```

**Restricts to specific values only.**

### Multiple Type Union

```typescript
const db: Database<sqlite3.Database, sqlite3.Statement> | null = null;
```

**Value can be either type or null.**

### Union Type in Parameters

```typescript
interface Message {
  role: "user" | "assistant";
  content: string;
}
```

---

## Optional Properties

### Optional Interface Properties

```typescript
interface Message {
  id?: number; // Optional
  session_id: string; // Required
  timestamp?: string; // Optional
}
```

### Optional Function Parameters

```typescript
const { message, sessionId = "default" } = req.body;
```

**Pattern:** Default value provides fallback.

### Optional Chaining

```typescript
messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
const reader = response.body?.getReader();
```

**Usage:**

- `?.` operator
- Safely access nested properties
- Returns `undefined` if property doesn't exist

### Nullish Coalescing

```typescript
const sessions = data.sessions || [];
```

**Alternative with `??`:**

```typescript
const sessions = data.sessions ?? [];
```

---

## Type Assertions

### as Keyword

```typescript
const assistantMessage = response.content as string;
```

**Usage:** Tell TypeScript to treat value as specific type.

### Type Casting in Arrays

```typescript
const filteredHistory = (data.history || []).filter(
  (msg: Message) => msg.content !== ""
);
```

**Pattern:** Inline type annotation in function parameter.

---

## Utility Types

### Promise Type

```typescript
async function saveMessage(message: Message): Promise<Message> {
  return savedMessage;
}
```

**All async functions return Promise.**

### Void Type

```typescript
async function initDatabase(): Promise<void> {
  // No return value
}
```

### Record Type

```typescript
type SessionMap = Record<string, Message[]>;
```

**Pattern:** Object with string keys and Message[] values.

---

## Import/Export Types

### Named Exports

```typescript
export interface Message {
  // ...
}

export async function saveMessage(message: Message): Promise<Message> {
  // ...
}
```

### Named Imports

```typescript
import { Message, saveMessage, initDatabase } from "./database";
```

### Type-Only Imports

```typescript
import type { Request, Response } from "express";
```

**Note:** This project uses runtime imports for Request/Response.

### Default Import/Export

```typescript
// Export
export default App;

// Import
import App from "./App";
```

---

## Destructuring with Types

### Object Destructuring

```typescript
const { message, sessionId = "default" } = req.body;
```

**With type annotation:**

```typescript
const { sessionId }: { sessionId: string } = req.params;
```

### Array Destructuring

```typescript
const [messages, setMessages] = useState<Message[]>([]);
```

---

## Type Inference

### Automatic Type Inference

```typescript
const [input, setInput] = useState(""); // Inferred as string
const [isLoading, setIsLoading] = useState(false); // Inferred as boolean
```

TypeScript infers types from initial values.

### When to Add Explicit Types

```typescript
// ✅ Good - explicit type needed
const [messages, setMessages] = useState<Message[]>([]);

// ❌ Could be inferred
const [input, setInput] = useState<string>("");
```

**Rule:** Add types when inference isn't sufficient.

---

## TypeScript Configuration

### tsconfig.json (Backend)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**Key Options:**

- `strict`: Enable all strict type checking
- `esModuleInterop`: Better CommonJS/ES6 compatibility
- `outDir`: Compiled JavaScript output directory

### tsconfig.json (Frontend)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Key Options:**

- `jsx`: React JSX support
- `noEmit`: Vite handles compilation
- `lib`: Include DOM types for browser APIs

---

## Common Type Patterns

### API Response Type

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
```

### State Setter Type

```typescript
setMessages((prev) => [...prev, newMessage]);
```

**Type:** `React.Dispatch<React.SetStateAction<Message[]>>`

### Component Props Type

```typescript
interface MessageProps {
  message: Message;
  index: number;
}

function MessageComponent({ message, index }: MessageProps) {
  // ...
}
```

---

## Type Guards

### typeof Type Guard

```typescript
if (typeof value === "string") {
  // value is string here
}
```

### Truthiness Check

```typescript
if (!db) throw new Error("Database not initialized");
// db is defined after this line
```

### Property Check

```typescript
if (data.done) {
  break;
}
```

---

## Key Concepts

### Static Type Checking

TypeScript checks types at compile time, preventing runtime errors.

### Type Inference

TypeScript automatically determines types when possible:

```typescript
const count = 0; // inferred as number
```

### Strict Mode Benefits

- Catches `null` and `undefined` errors
- Requires explicit types for function parameters
- Prevents implicit `any` types

### Compilation

TypeScript compiles to JavaScript:

```bash
tsc                    # Compile project
tsx watch src/server.ts  # Watch mode
```

---

## Dependencies

### TypeScript Compiler

```json
{
  "typescript": "^5.3.3"
}
```

### Type Definitions

```json
{
  "@types/express": "^5.0.6",
  "@types/cors": "^2.8.17",
  "@types/node": "^25.0.3",
  "@types/react": "^19.2.7",
  "@types/react-dom": "^19.2.3"
}
```

**Purpose:** Type definitions for JavaScript libraries.

---

_Last Updated: January 6, 2026_
