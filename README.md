# ChatGPT UI with LangChain Integration

A full-stack conversational AI application integrating OpenAI's GPT-4.1 nano model through LangChain. The system features a React-based frontend, Express backend with TypeScript, and SQLite persistence layer.

## System Overview

This application provides a web-based chat interface for interacting with OpenAI's language models. All API interactions are routed through LangChain for enhanced message handling and extensibility.

### Core Features

- Real-time streaming responses via Server-Sent Events
- Multi-session conversation management with SQLite persistence
- Session creation, deletion, and history retrieval
- ChatGPT-inspired user interface
- RESTful API for programmatic access

### Architecture

**Backend Stack**

- Express.js server (TypeScript)
- LangChain for OpenAI API integration
- SQLite database for message persistence
- Server-Sent Events for response streaming
- CORS-enabled REST endpoints

**Frontend Stack**

- React 19 with TypeScript
- Vite development server and build tool
- CSS3 for ChatGPT-style interface
- Real-time message streaming display

## Prerequisites

- Node.js v18 or higher
- npm package manager
- OpenAI API key with active credits

## Installation

### Backend Configuration

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create environment configuration:

```bash
cp .env.example .env
```

Configure the `.env` file with your OpenAI credentials:

```
OPENAI_API_KEY=sk-your-api-key-here
PORT=3001
```

### Frontend Configuration

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

### Root Configuration

Install root-level dependencies for concurrent server execution:

```bash
npm install
```

## Running the Application

### Option 1: Concurrent Execution (Recommended)

Run both servers from the project root:

```bash
npm start
```

This uses concurrently to run backend and frontend servers in a single terminal with color-coded output.

### Option 2: Manual Execution

Start backend server:

```bash
cd backend
npm run dev
```

Start frontend server in separate terminal:

```bash
cd frontend
npm run dev
```

The application will be accessible at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## API Reference

### POST /api/chat

Process user message and return AI response.

**Request Body:**

```json
{
  "message": "string",
  "sessionId": "string",
  "streaming": boolean
}
```

**Response (non-streaming):**

```json
{
  "message": "string"
}
```

**Response (streaming):**
Server-Sent Events stream with content chunks.

### GET /api/history/:sessionId

Retrieve message history for specified session.

**Response:**

```json
{
  "history": [
    {
      "id": 1,
      "session_id": "session-1234567890",
      "role": "user|assistant",
      "content": "string",
      "timestamp": "ISO8601"
    }
  ]
}
```

### GET /api/sessions

Retrieve all session identifiers.

**Response:**

```json
{
  "sessions": ["session-1234567890", "session-0987654321"]
}
```

### POST /api/sessions

Create new conversation session.

**Request Body:**

```json
{
  "sessionId": "string"
}
```

**Response:**

```json
{
  "success": true
}
```

### DELETE /api/sessions/:sessionId

Delete session and associated messages.

**Response:**

```json
{
  "success": true
}
```

### GET /api/health

Health check endpoint.

**Response:**

```json
{
  "status": "OK"
}
```

## Database Schema

### messages Table

| Column     | Type     | Description                   |
| ---------- | -------- | ----------------------------- |
| id         | INTEGER  | Primary key, auto-increment   |
| session_id | TEXT     | Session identifier            |
| role       | TEXT     | Message role (user/assistant) |
| content    | TEXT     | Message content               |
| timestamp  | DATETIME | Creation timestamp (UTC)      |

## Project Structure

```
integrating-langchain-into-a-chatgpt-ui/
├── backend/
│   ├── src/
│   │   ├── server.ts       # Express server with LangChain integration
│   │   └── database.ts     # SQLite database operations
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Main React component
│   │   ├── App.css         # Application styles
│   │   └── main.tsx        # React entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/
│   └── instructions.txt
├── package.json            # Root package.json for concurrently
├── check.ps1               # PowerShell script to check running processes
├── stop.ps1                # PowerShell script to stop running processes
└── README.md
```

## LangChain Integration

The application uses LangChain to manage all interactions with OpenAI's API. This provides:

- Structured message history handling
- Streaming response support
- Type-safe message interfaces
- Extensibility for future enhancements (memory, tools, agents)

**Implementation Example:**

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4.1-nano",
  temperature: 0.7,
  streaming: true,
});

const messages = history.map((msg) =>
  msg.role === "user"
    ? new HumanMessage(msg.content)
    : new AIMessage(msg.content)
);

const stream = await chatModel.stream(messages);
```

## AI Model Configuration

This project uses GPT-4.1 nano, OpenAI's most cost-effective model:

- Input: $0.20 per 1M tokens
- Output: $0.80 per 1M tokens

The model is configured in backend/src/server.ts and can be changed by modifying the modelName parameter in the ChatOpenAI constructor.

## Development

### Backend Scripts

```bash
npm run dev      # Start development server with watch mode
npm run build    # Compile TypeScript to JavaScript
npm start        # Run compiled production build
```

### Frontend Scripts

```bash
npm run dev      # Start Vite development server
npm run build    # Build production bundle
npm run preview  # Preview production build
```

## Session Management

Sessions are identified by unique IDs in the format `session-{timestamp}`, where timestamp is Unix epoch time in milliseconds. Sessions persist across page refreshes and are stored in the SQLite database.

Session operations:

- Create: Click "New Chat" or send first message
- Switch: Click session in sidebar
- Delete: Hover over session and click delete icon

## Troubleshooting

### Database Initialization Errors

Ensure the backend process has write permissions in its working directory. The chat.db file is created automatically on first run.

### OpenAI API Errors

- Verify API key is correctly set in backend/.env
- Confirm OpenAI account has available credits
- Check for rate limiting if experiencing throttling

### CORS Issues

Ensure backend is running on port 3001 and frontend proxy configuration in vite.config.ts is correct.

### Streaming Not Working

- Verify backend is running in development mode
- Check browser console for connection errors
- Toggle streaming setting in UI

### Process Termination Issues

When using concurrently, press Ctrl+C to terminate. On Windows, if processes persist, use the provided script:

```powershell
.\stop.ps1
```

Or manually:

```powershell
Get-Process node | Stop-Process -Force
```

## Technology Stack

**Backend Dependencies:**

- express: Web server framework
- @langchain/openai: OpenAI integration
- @langchain/core: LangChain core functionality
- sqlite3: Database driver
- dotenv: Environment variable management
- cors: Cross-origin resource sharing
- tsx: TypeScript execution

**Frontend Dependencies:**

- react: UI framework
- react-dom: React DOM rendering
- typescript: Type system
- vite: Build tool and dev server

## License

MIT
