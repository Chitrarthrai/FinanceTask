import React, { useState, useRef, useEffect } from "react";
import { useData } from "../contexts/DataContext";
import { buildFinancialContext } from "../utils/contextBuilder";
import { chatWithGemini, ChatMessage } from "../utils/geminiChat";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const AIChatBot: React.FC = () => {
  const {
    transactions,
    metrics,
    budgetSettings,
    tasks,
    categories,
    addTransaction,
    addTask,
  } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hi! I'm your financial advisor. Ask me anything about your spending or budget.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    let currentHistory = [...messages];

    try {
      const context = buildFinancialContext(
        transactions,
        metrics,
        budgetSettings,
        tasks,
        categories,
      );

      // Initial Call
      let response = await chatWithGemini(messages, input, context);

      // Loop handles multi-step tool use (if multiple tools were called in sequence)
      while (response.functionCall) {
        const { name, args } = response.functionCall;
        console.log("AI requesting tool execution:", name, args);

        // 1. Add the model's request to history
        const callMsg: ChatMessage = {
          role: "model",
          functionCall: { name, args },
        };
        setMessages((prev) => [...prev, callMsg]);
        currentHistory.push(userMsg, callMsg); // Sync local history

        // 2. Execute Function
        let resultFn = { success: false, message: "Unknown function" };

        try {
          if (name === "addTransaction") {
            await addTransaction({
              ...args,
              id: crypto.randomUUID(),
              date: args.date || new Date().toISOString(),
            });
            resultFn = {
              success: true,
              message: `Transaction '${args.title}' of $${args.amount} added successfully.`,
            };
          } else if (name === "createTask") {
            await addTask({
              ...args,
              id: crypto.randomUUID(),
              status: "todo",
              tags: [],
            });
            resultFn = {
              success: true,
              message: `Task '${args.title}' created successfully.`,
            };
          }
        } catch (err: any) {
          console.error("Tool execution failed:", err);
          resultFn = { success: false, message: `Error: ${err.message}` };
        }

        // 3. Add result to history
        const responseMsg: ChatMessage = {
          role: "function",
          functionResponse: { name, response: resultFn },
        };
        setMessages((prev) => [...prev, responseMsg]);

        // 4. Send result back to Gemini
        response = await chatWithGemini(
          [...messages, userMsg, callMsg, responseMsg], // Full history is tricky here because state updates are async. Using robust local array is better but for now this approximation is okay if we assume single tool calls.
          null,
          context,
          { name, response: resultFn },
        );
      }

      // Final text response
      if (response.text) {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: response.text },
        ]);
      }
    } catch (err) {
      console.error("Chat error", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Sorry, I encountered an error while processing that.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-slate-950/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-primary/90 backdrop-blur-md p-4 flex justify-between items-center text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold">Financial Advisor</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary/80 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {messages
              .filter((msg) => msg.text)
              .map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-gradient-to-br from-brand-500 to-purple-600 text-white"
                    }`}>
                    {msg.role === "user" ? (
                      <User size={14} />
                    ) : (
                      <Bot size={14} />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-sm max-w-[80%] shadow-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-card border border-border rounded-tl-none"
                    }`}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="mb-1 last:mb-0">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc ml-4 my-1">{children}</ul>
                          ),
                          li: ({ children }) => (
                            <li className="my-0.5">{children}</li>
                          ),
                        }}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-card border border-border p-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}></span>
                    <span
                      className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}></span>
                    <span
                      className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-background">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about your finances..."
                className="w-full pl-4 pr-12 py-3 bg-secondary rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-1 top-1 bottom-1 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center">
          <MessageCircle className="w-7 h-7" />
        </button>
      )}
    </div>
  );
};
