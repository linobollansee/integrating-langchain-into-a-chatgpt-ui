# LangChain Syntax Documentation

This document provides a comprehensive reference for all LangChain syntax and usage patterns in this project.

## Table of Contents

- [Imports](#imports)
- [Model Initialization](#model-initialization)
- [Message Types](#message-types)
- [Streaming Responses](#streaming-responses)
- [Invoke Method](#invoke-method)
- [Message Conversion](#message-conversion)

---

## Imports

### OpenAI Integration

```typescript
import { ChatOpenAI } from "@langchain/openai";
```

### Core Message Types

```typescript
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
```

**Purpose:**

- `ChatOpenAI`: Main chat model class for OpenAI integration
- `HumanMessage`: Represents user messages
- `AIMessage`: Represents assistant/AI messages
- `BaseMessage`: Base type for all message objects

---

## Model Initialization

### ChatOpenAI Configuration

```typescript
const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4.1-nano",
  temperature: 0.7,
  streaming: true,
});
```

**Parameters:**

- `openAIApiKey`: Your OpenAI API key (from environment variables)
- `modelName`: The specific OpenAI model to use
- `temperature`: Controls randomness (0-1, higher = more creative)
- `streaming`: Enables streaming responses

---

## Message Types

### Creating Human Messages

```typescript
new HumanMessage(message);
```

Represents a message from the user/human in the conversation.

### Creating AI Messages

```typescript
new AIMessage(msg.content);
```

Represents a message from the AI assistant in the conversation.

### BaseMessage Array

```typescript
const langchainMessages: BaseMessage[] = [
  new HumanMessage("Hello"),
  new AIMessage("Hi there!"),
];
```

An array that can hold both `HumanMessage` and `AIMessage` objects.

---

## Streaming Responses

### Using the Stream Method

```typescript
const stream = await chatModel.stream(langchainMessages);

for await (const chunk of stream) {
  const content = chunk.content;
  fullResponse += content;
  // Process each chunk as it arrives
}
```

**Usage Pattern:**

1. Call `chatModel.stream()` with an array of `BaseMessage` objects
2. Iterate over the async stream using `for await...of`
3. Each `chunk` contains a `content` property with partial response text
4. Accumulate chunks to build the full response

**When to Use:**

- Real-time display of AI responses
- Improved user experience with immediate feedback
- Suitable for Server-Sent Events (SSE) implementation

---

## Invoke Method

### Non-Streaming Response

```typescript
const response = await chatModel.invoke(langchainMessages);
const assistantMessage = response.content as string;
```

**Usage Pattern:**

1. Call `chatModel.invoke()` with an array of `BaseMessage` objects
2. Wait for the complete response
3. Extract the message content from `response.content`

**When to Use:**

- Simple request-response patterns
- When you need the complete response before proceeding
- No real-time streaming requirements

---

## Message Conversion

### Converting Database History to LangChain Messages

```typescript
const langchainMessages: BaseMessage[] = history
  .slice(0, -1)
  .map((msg: Message) =>
    msg.role === "user"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content)
  );
```

**Pattern:**

1. Take conversation history from database
2. Map each message to appropriate LangChain message type
3. Check `role` field to determine message type
4. Create `HumanMessage` for user messages
5. Create `AIMessage` for assistant messages

### Adding Current Message

```typescript
langchainMessages.push(new HumanMessage(message));
```

After converting history, append the current user message to the array.

---

## Complete Example Flow

### Full Chat Implementation

```typescript
// 1. Get conversation history from database
const history = await getConversationHistory(sessionId);

// 2. Convert to LangChain message format
const langchainMessages: BaseMessage[] = history
  .slice(0, -1)
  .map((msg: Message) =>
    msg.role === "user"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content)
  );

// 3. Add current user message
langchainMessages.push(new HumanMessage(message));

// 4a. Streaming response
const stream = await chatModel.stream(langchainMessages);
for await (const chunk of stream) {
  const content = chunk.content;
  // Process chunk
}

// OR

// 4b. Non-streaming response
const response = await chatModel.invoke(langchainMessages);
const assistantMessage = response.content as string;
```

---

## Key Concepts

### Message Flow

1. **Input**: Array of `BaseMessage` objects (conversation history + current message)
2. **Processing**: LangChain handles API communication with OpenAI
3. **Output**: Either streamed chunks or complete response

### Type Safety

- `BaseMessage[]` allows mixing `HumanMessage` and `AIMessage` in conversation
- TypeScript ensures type safety throughout the message chain

### Conversation Context

- LangChain automatically maintains conversation context
- Pass entire message history for context-aware responses
- Messages maintain their role (user/assistant) distinction

---

## Dependencies

### Required Packages

```json
{
  "@langchain/openai": "^x.x.x",
  "@langchain/core": "^x.x.x"
}
```

### Environment Variables

```
OPENAI_API_KEY=your_openai_api_key
```

---

_Last Updated: January 6, 2026_
