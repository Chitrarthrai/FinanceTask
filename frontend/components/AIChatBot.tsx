import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { buildFinancialContext } from '../utils/contextBuilder';
import { chatWithGemini, ChatMessage } from '../utils/geminiChat';
import { X, Send, Bot, User, Sparkles, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';

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
      role: 'model',
      text: "Hello! I'm your Titanium AI Assistant. Ask me about budget velocity, cash flow trends, or tell me to log transactions and tasks.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const context = buildFinancialContext(
        transactions,
        metrics,
        budgetSettings,
        tasks,
        categories
      );

      let response = await chatWithGemini(messages, input, context);

      while (response.functionCall) {
        const { name, args } = response.functionCall;
        const callMsg: ChatMessage = {
          role: 'model',
          functionCall: { name, args },
        };
        setMessages((prev) => [...prev, callMsg]);

        let resultFn = { success: false, message: 'Unknown function' };

        try {
          if (name === 'addTransaction') {
            await addTransaction({
              ...args,
              id: crypto.randomUUID(),
              date: args.date || new Date().toISOString(),
            });
            resultFn = {
              success: true,
              message: `Transaction '${args.title}' of $${args.amount} added.`,
            };
          } else if (name === 'createTask') {
            await addTask({
              ...args,
              id: crypto.randomUUID(),
              status: 'todo',
              tags: [],
            });
            resultFn = {
              success: true,
              message: `Task '${args.title}' created.`,
            };
          }
        } catch (err: any) {
          resultFn = { success: false, message: `Error: ${err.message}` };
        }

        const responseMsg: ChatMessage = {
          role: 'function',
          functionResponse: { name, response: resultFn },
        };
        setMessages((prev) => [...prev, responseMsg]);

        response = await chatWithGemini(
          [...messages, userMsg, callMsg, responseMsg],
          null,
          context,
          { name, response: resultFn }
        );
      }

      if (response.text) {
        setMessages((prev) => [...prev, { role: 'model', text: response.text }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Encountered an issue processing that query. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Chat Dialog */}
      {isOpen && (
        <div className="mb-4 w-[360px] sm:w-[420px] h-[520px] glass-panel rounded-2xl border border-[var(--border-rim)] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="p-3.5 border-b border-[var(--border-rim)] bg-[var(--surface-l2)] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-primary-light)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs font-display text-[var(--text-primary)]">
                  Titanium AI Intelligence
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-mono text-[var(--success)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" /> Live
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4 text-[var(--text-muted)]" />
            </Button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
            {messages
              .filter((msg) => msg.text)
              .map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)]'
                        : 'bg-[var(--surface-l2)] border border-[var(--border-rim)] text-[var(--accent-primary)]'
                    }`}
                  >
                    {msg.role === 'user' ? <User size={13} /> : <Sparkles size={13} />}
                  </div>

                  <div
                    className={`p-3 rounded-xl text-xs max-w-[82%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)] font-medium rounded-tr-none'
                        : 'bg-[var(--surface-l2)] border border-[var(--border-rim)] text-[var(--text-primary)] rounded-tl-none'
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc ml-3 my-1">{children}</ul>,
                        li: ({ children }) => <li className="my-0.5">{children}</li>,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}

            {loading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-xl bg-[var(--surface-l2)] border border-[var(--border-rim)] text-[var(--accent-primary)] flex items-center justify-center">
                  <Bot size={13} />
                </div>
                <div className="px-3 py-2 rounded-xl bg-[var(--surface-l2)] border border-[var(--border-rim)] text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-ping" />
                  Analyzing context & executing queries...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-[var(--border-rim)] bg-[var(--surface-l1)]">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Ask about finances or log a task..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={loading}
                className="py-1.5 text-xs flex-1"
              />
              <Button
                variant="primary"
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || loading}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-secondary)] text-[var(--text-inverted)] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-white/20 group"
          title="Open AI Assistant"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[var(--cyan)] border-2 border-[var(--bg-app)] animate-pulse" />
        </button>
      )}
    </div>
  );
};

export default AIChatBot;
