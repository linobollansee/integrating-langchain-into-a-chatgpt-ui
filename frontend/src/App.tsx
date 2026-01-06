import { useState, useEffect, useRef } from "react";
import "./App.css";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState("default");
  const [sessions, setSessions] = useState<string[]>([]);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Load conversation history when session changes
  useEffect(() => {
    loadHistory(currentSessionId);
  }, [currentSessionId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      const data = await response.json();
      const fetchedSessions = data.sessions || [];
      setSessions(fetchedSessions);

      // Set current session to first one if we have sessions
      if (fetchedSessions.length > 0) {
        if (!currentSessionId || !fetchedSessions.includes(currentSessionId)) {
          setCurrentSessionId(fetchedSessions[0]);
        }
      } else {
        // No sessions - clear current session
        setCurrentSessionId("");
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const loadHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/history/${sessionId}`);
      const data = await response.json();
      // Filter out empty placeholder messages
      const filteredHistory = (data.history || []).filter(
        (msg: Message) => msg.content !== ""
      );
      setMessages(filteredHistory);
    } catch (error) {
      console.error("Error loading history:", error);
      setMessages([]);
    }
  };

  const createNewSession = async () => {
    const newSessionId = `session-${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setMessages([]);
    // Optimistically add to UI
    setSessions((prev) => [newSessionId, ...prev]);

    // Save the session to the database in background
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: newSessionId }),
      });
    } catch (error) {
      console.error("Error creating session:", error);
      // Revert on error
      setSessions((prev) => prev.filter((s) => s !== newSessionId));
    }
  };

  const deleteConversation = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent session selection when clicking delete

    // Optimistically remove from UI immediately
    const remainingSessions = sessions.filter((s) => s !== sessionId);
    setSessions(remainingSessions);

    // If we deleted the current session, handle state
    if (sessionId === currentSessionId) {
      if (remainingSessions.length > 0) {
        setCurrentSessionId(remainingSessions[0]);
      } else {
        // No sessions left - clear everything
        setCurrentSessionId("");
        setMessages([]);
      }
    }

    // Delete from backend
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      // Revert on error
      setSessions(sessions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (streamingEnabled) {
        await handleStreamingResponse(userMessage.content);
      } else {
        await handleNonStreamingResponse(userMessage.content);
      }

      // Refresh sessions list if this is a new session
      if (!sessions.includes(currentSessionId)) {
        fetchSessions();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNonStreamingResponse = async (message: string) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        sessionId: currentSessionId,
        streaming: false,
      }),
    });

    const data = await response.json();
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data.message,
      },
    ]);
  };

  const handleStreamingResponse = async (message: string) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

    let assistantMessage = "";
    let assistantMessageIndex = messages.length + 1;

    // Add empty assistant message that will be updated
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
      },
    ]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = JSON.parse(line.slice(6));

          if (data.done) {
            break;
          }

          if (data.content) {
            assistantMessage += data.content;

            // Update the assistant message in real-time
            setMessages((prev) => {
              const updated = [...prev];
              updated[assistantMessageIndex] = {
                role: "assistant",
                content: assistantMessage,
              };
              return updated;
            });
          }
        }
      }
    }
  };

  return (
    <div className="app">
      <div className="sidebar">
        <h2>Chat Sessions</h2>
        <button className="new-chat-btn" onClick={createNewSession}>
          New Chat
        </button>
        <div className="sessions-list">
          {sessions.map((sessionId) => (
            <div
              key={sessionId}
              className={`session-item ${
                sessionId === currentSessionId ? "active" : ""
              }`}
              onClick={() => setCurrentSessionId(sessionId)}
            >
              <span className="session-name">{sessionId}</span>
              <button
                className="delete-btn"
                onClick={(e) => deleteConversation(sessionId, e)}
                title="Delete conversation"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
        <div className="streaming-toggle">
          <label>
            <input
              type="checkbox"
              checked={streamingEnabled}
              onChange={(e) => setStreamingEnabled(e.target.checked)}
            />
            Enable Streaming
          </label>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <h1>ChatGPT UI with LangChain</h1>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <h2>👋 Welcome!</h2>
              <p>Start a conversation by typing a message below.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-role">
                  {message.role === "user" ? "You" : "Assistant"}
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))
          )}
          {isLoading && !streamingEnabled && (
            <div className="loading">
              <span>Assistant is thinking</span>
              <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <form className="input-wrapper" onSubmit={handleSubmit}>
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
              placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="send-button"
              disabled={isLoading || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
