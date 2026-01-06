import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import {
  initDatabase,
  saveMessage,
  getConversationHistory,
  getAllSessions,
  deleteSession,
  createSession,
  Message,
} from "./database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize LangChain ChatGPT model
const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4.1-nano",
  temperature: 0.7,
  streaming: true,
});

// Chat endpoint
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message, sessionId = "default" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Save user message to database
    await saveMessage({
      session_id: sessionId,
      role: "user",
      content: message,
    });

    // Get conversation history for context
    const history = await getConversationHistory(sessionId);

    // Convert history to LangChain message format (excluding the just-saved user message)
    const langchainMessages: BaseMessage[] = history
      .slice(0, -1)
      .map((msg: Message) =>
        msg.role === "user"
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      );

    // Add current user message
    langchainMessages.push(new HumanMessage(message));

    // Check if streaming is requested
    const streaming = req.body.streaming === true;

    if (streaming) {
      // Set headers for SSE (Server-Sent Events)
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let fullResponse = "";

      const stream = await chatModel.stream(langchainMessages);

      for await (const chunk of stream) {
        const content = chunk.content;
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }

      // Save assistant response to database
      await saveMessage({
        session_id: sessionId,
        role: "assistant",
        content: fullResponse,
      });

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } else {
      // Non-streaming response
      const response = await chatModel.invoke(langchainMessages);
      const assistantMessage = response.content as string;

      // Save assistant response to database
      await saveMessage({
        session_id: sessionId,
        role: "assistant",
        content: assistantMessage,
      });

      res.json({ message: assistantMessage });
    }
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get conversation history endpoint
app.get("/api/history/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const history = await getConversationHistory(sessionId);
    res.json({ history });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all sessions endpoint
app.get("/api/sessions", async (req: Request, res: Response) => {
  try {
    const sessions = await getAllSessions();
    res.json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new session endpoint
app.post("/api/sessions", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }
    await createSession(sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//
// Delete session endpoint
app.delete("/api/sessions/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    await deleteSession(sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK" });
});

// Initialize database and start server
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
