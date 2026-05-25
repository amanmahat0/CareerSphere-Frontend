import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";
import Logo from "../Logo/Logo";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "bot",
  text: "Hi! I'm CareerBot 👋 I can help you with applying for jobs, tracking your applications, building your resume, and anything else on CareerSphere. What would you like to know?",
  timestamp: new Date(),
};

const QUICK_REPLIES = [
  "How do I apply?",
  "Track my application",
  "Build my resume",
  "View interviews",
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
        <Sparkles size={12} className="text-white" />
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function renderInline(line) {
  const result = [];
  const regex = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > last) result.push(line.slice(last, match.index));
    result.push(<strong key={match.index}>{match[1]}</strong>);
    last = match.index + match[0].length;
  }
  if (last < line.length) result.push(line.slice(last));
  return result.length > 0 ? result : line;
}

function formatText(text) {
  const lines = text.split("\n");
  const elements = [];
  let listItems = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="list-none space-y-1 mt-1">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-70" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    const bulletMatch = line.match(/^[\-•*]\s+(.+)/);
    const numberedMatch = line.match(/^\d+[\.\)]\s+(.+)/);
    if (bulletMatch || numberedMatch) {
      listItems.push((bulletMatch || numberedMatch)[1]);
    } else {
      flushList(i);
      if (line.trim() === "") {
        if (elements.length > 0) elements.push(<br key={`br-${i}`} />);
      } else {
        elements.push(<p key={`p-${i}`} className="mb-0.5">{renderInline(line)}</p>);
      }
    }
  });

  flushList("end");
  return elements;
}

function MessageBubble({ message }) {
  const isBot = message.role === "bot";
  return (
    <div className={`flex items-end gap-2 ${isBot ? "" : "flex-row-reverse"}`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <Sparkles size={12} className="text-white" />
        </div>
      )}
      <div
        className={`px-4 py-2 text-sm max-w-xs leading-relaxed ${
          isBot
            ? "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
            : "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
        }`}
      >
        {formatText(message.text)}
      </div>
    </div>
  );
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const leaveTimer = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // Clean up timer on unmount
  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  function handleMouseEnter() {
    clearTimeout(leaveTimer.current);
    setIsOpen(true);
  }

  function handleMouseLeave() {
    // Small delay so moving between button and panel doesn't flicker
    leaveTimer.current = setTimeout(() => setIsOpen(false), 300);
  }

  function handleClose() {
    clearTimeout(leaveTimer.current);
    setIsOpen(false);
  }

  function getUserRole() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return undefined;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role;
    } catch {
      return undefined;
    }
  }

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setShowQuickReplies(false);
    setInputText("");

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", text: trimmed, timestamp: new Date() },
    ]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chatbot/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, role: getUserRole() }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: data.reply || "Sorry, I didn't understand that. Could you rephrase?",
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: "Sorry, I'm having trouble connecting. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Chat Panel */}
      {isOpen && (
        <div className="w-80 h-120 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 shrink-0">
            <div className="flex items-center gap-2">
              <Logo width={28} height={28} />
              <div>
                <p className="text-white font-semibold text-sm leading-none">CareerBot</p>
                <p className="text-blue-100 text-xs mt-0.5">Always here to help</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {showQuickReplies && (
              <div className="flex flex-wrap gap-2 pl-9">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => sendMessage(qr)}
                    className="text-xs bg-white border border-blue-200 text-blue-600 rounded-full px-3 py-1.5 hover:bg-blue-50 transition-colors"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button — shows Logo, X when open */}
      <button
        onClick={() => isOpen ? handleClose() : setIsOpen(true)}
        aria-label="Open CareerBot chat"
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
      >
        {isOpen ? <X size={22} /> : <Logo width={30} height={30} />}
      </button>
    </div>
  );
}
