"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { authService, UserProfile } from "@/services/authService";
import { roadmapService } from "@/services/roadmapService";
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  HelpCircle,
  BookOpen,
  Calendar,
  Layers,
  Brain,
  Terminal,
  Info,
  ChevronRight,
  ExternalLink,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  provider?: string;
  isLiveAI?: boolean;
}

const SUGGESTED_PROMPTS = [
  {
    icon: HelpCircle,
    label: "Explain a topic in simple words",
    prompt: "Explain a topic in simple words: How do React Server Components work compared to client components?",
    category: "Concepts",
  },
  {
    icon: Calendar,
    label: "Help me create a study plan",
    prompt: "Help me create a study plan for mastering full-stack web development over the next 4 weeks.",
    category: "Planning",
  },
  {
    icon: BookOpen,
    label: "Recommend learning resources",
    prompt: "Recommend learning resources, high-yield tutorials, and capstone projects for my learning path.",
    category: "Resources",
  },
  {
    icon: Brain,
    label: "Quiz me on a topic",
    prompt: "Quiz me on a topic: Give me a multiple-choice question testing my understanding of frontend state management.",
    category: "Knowledge Check",
  },
];

const INITIAL_GREETING: Message = {
  id: "initial-greeting",
  role: "assistant",
  content:
    "Hi! I'm **Shiksha Bot**, your 24/7 AI tutor and engineering guide. How can I help you learn today?\n\nI can explain complex concepts in plain language, write and debug code, design tailored study roadmaps, recommend high-impact resources, or quiz you to test your mastery.",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  provider: "Live AI Tutor",
  isLiveAI: true,
};

export default function ShikshaBotPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("shiksha_bot_messages");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // fallback
      }
    }
    return [INITIAL_GREETING];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<{
    name: string;
    isLive: boolean;
  }>({
    name: "Live AI Tutor (Gemini)",
    isLive: true,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync user profile from authService on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem("shiksha_bot_messages", JSON.stringify(messages));
    } catch {
      // ignore storage errors
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userTimestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMsgList: Message[] = [
      ...messages,
      {
        id: userMessageId,
        role: "user",
        content: query,
        timestamp: userTimestamp,
      },
    ];

    setMessages(newMsgList);
    setInputMessage("");
    setIsLoading(true);

    // Auto reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const activeRoadmap = roadmapService.getActiveRoadmap();
      const targetGoal =
        activeRoadmap?.targetRole ||
        user?.learningPreferences?.targetGoal ||
        "Software Engineering";
      const experienceLevel =
        activeRoadmap?.experienceLevel ||
        user?.learningPreferences?.experienceLevel ||
        "Intermediate";
      const knownSkills =
        activeRoadmap?.knownSkills ||
        user?.learningPreferences?.knownSkills ||
        [];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgList.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userContext: {
            targetGoal,
            experienceLevel,
            knownSkills,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const assistantTimestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: data.reply || "I'm here to help! What would you like to explore next?",
          timestamp: assistantTimestamp,
          provider: data.provider || "Shiksha AI Knowledge Engine",
          isLiveAI: data.isLiveAI || false,
        },
      ]);

      if (data.provider) {
        setActiveProvider({
          name: data.provider,
          isLive: !!data.isLiveAI,
        });
      }
    } catch (err) {
      console.error("Failed to send chat message:", err);
      const errorTimestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: "assistant",
          content:
            "⚠️ **Connection Issue:** Unable to connect to the assistant server right now. Please check your network and try again in a moment.",
          timestamp: errorTimestamp,
          provider: "System Notice",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear this conversation?")) {
      const resetList = [INITIAL_GREETING];
      setMessages(resetList);
      localStorage.setItem("shiksha_bot_messages", JSON.stringify(resetList));
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Simple Markdown-style parser for assistant responses
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <div
              key={`code-${idx}`}
              className="my-3 rounded-lg overflow-hidden bg-[#292827] text-[#F6F1E9] text-xs font-mono border border-[#292827]/40 shadow-xs"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#292827]/90 border-b border-[#F6F1E9]/10 text-[#F6F1E9]/60 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Terminal size={12} className="text-[#D8C8BA]" />
                  Code Snippet
                </span>
                <button
                  onClick={() => handleCopyMessage(`code-${idx}`, codeBuffer.join("\n"))}
                  className="hover:text-[#F6F1E9] transition-colors flex items-center gap-1 text-[11px]"
                >
                  {copiedId === `code-${idx}` ? (
                    <>
                      <Check size={11} className="text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={11} /> Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto whitespace-pre leading-relaxed text-[#F6F1E9]">
                <code>{codeBuffer.join("\n")}</code>
              </pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBuffer = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Headers
      if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={`h3-${idx}`}
            className="text-base font-semibold text-[#292827] mt-3 mb-1.5 flex items-center gap-2 font-serif"
          >
            {line.replace("### ", "")}
          </h3>
        );
        return;
      }

      if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={`h2-${idx}`}
            className="text-lg font-semibold text-[#54252C] mt-4 mb-2 font-serif"
          >
            {line.replace("## ", "")}
          </h2>
        );
        return;
      }

      // Alerts & callouts
      if (line.startsWith("> [!TIP]") || line.startsWith("> ")) {
        elements.push(
          <div
            key={`tip-${idx}`}
            className="my-2.5 p-3 rounded-lg bg-[#D8C8BA]/25 border-l-4 border-[#54252C] text-xs sm:text-sm text-[#292827]/90 leading-relaxed font-sans"
          >
            {line.replace(/> \[\!TIP\]|>/g, "").trim()}
          </div>
        );
        return;
      }

      // Bullet lists
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const itemText = line.substring(2);
        elements.push(
          <div key={`li-${idx}`} className="flex items-start gap-2 my-1 text-sm text-[#292827]/90 leading-relaxed">
            <span className="text-[#54252C] mt-1 font-bold">•</span>
            <span>{parseInlineStyles(itemText)}</span>
          </div>
        );
        return;
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.*)$/);
        if (match) {
          elements.push(
            <div key={`num-${idx}`} className="flex items-start gap-2 my-1 text-sm text-[#292827]/90 leading-relaxed">
              <span className="text-[#54252C] font-semibold text-xs mt-0.5 min-w-4.5">
                {match[1]}.
              </span>
              <span>{parseInlineStyles(match[2])}</span>
            </div>
          );
          return;
        }
      }

      // Markdown Tables
      if (line.startsWith("|") && line.endsWith("|")) {
        if (line.includes("---")) return; // skip delimiter
        const cells = line
          .split("|")
          .filter((c, i, a) => i !== 0 && i !== a.length - 1)
          .map((c) => c.trim());
        elements.push(
          <div
            key={`tbl-${idx}`}
            className="grid grid-cols-4 gap-2 text-xs py-1.5 border-b border-[#D8C8BA]/60 text-[#292827]"
          >
            {cells.map((cell, cIdx) => (
              <div key={cIdx} className={cIdx === 0 ? "font-semibold text-[#54252C]" : "text-[#292827]/80"}>
                {parseInlineStyles(cell)}
              </div>
            ))}
          </div>
        );
        return;
      }

      // Blank lines
      if (!line.trim()) {
        elements.push(<div key={`blank-${idx}`} className="h-2" />);
        return;
      }

      // Normal paragraph
      elements.push(
        <p key={`p-${idx}`} className="my-1 text-sm text-[#292827]/90 leading-relaxed">
          {parseInlineStyles(line)}
        </p>
      );
    });

    return elements;
  };

  // Helper for bold and code tags inline
  const parseInlineStyles = (text: string) => {
    // Replace **bold** with <strong> and `code` with <code>
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-[#292827]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-[#D8C8BA]/40 text-[#54252C] font-mono text-[12px]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <AppLayout
      pageTitle="Shiksha Bot"
      pageSubtitle="Your 24/7 AI tutor and roadmap guide for personalized learning"
      actionElement={
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowConfigModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8C8BA] bg-white text-xs font-medium text-[#292827]/80 hover:text-[#54252C] hover:border-[#54252C]/30 transition-all shadow-2xs"
            title="AI Integration & Configuration Status"
          >
            <Zap size={13} className={activeProvider.isLive ? "text-emerald-600" : "text-[#803F47]"} />
            <span className="hidden sm:inline">Provider:</span>
            <span className="font-semibold text-[#54252C]">
              {activeProvider.isLive ? activeProvider.name : "Demo Knowledge Engine"}
            </span>
          </button>

          <button
            onClick={handleClearChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8C8BA] bg-white text-xs font-medium text-[#292827]/80 hover:bg-[#D8C8BA]/20 hover:text-[#54252C] transition-all shadow-2xs"
            title="Reset Conversation"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col h-[calc(100vh-13.5rem)] min-h-[520px] max-h-[820px] bg-white rounded-2xl border border-[#D8C8BA] shadow-xs overflow-hidden">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#F6F1E9]/20">
          {messages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto justify-end" : "mr-auto justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#54252C] text-[#F6F1E9] flex items-center justify-center shrink-0 shadow-2xs mt-1">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[88%] sm:max-w-[80%]`}
                >
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed transition-all shadow-2xs ${
                      isUser
                        ? "bg-[#54252C] text-[#F6F1E9] rounded-tr-xs"
                        : "bg-white border border-[#D8C8BA] text-[#292827] rounded-tl-xs"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="space-y-1">{renderFormattedContent(msg.content)}</div>
                    )}
                  </div>

                  {/* Metadata and Actions */}
                  <div className="flex items-center gap-2 mt-1.5 px-1 text-[11px] text-[#292827]/50 font-sans">
                    <span>{msg.timestamp}</span>
                    {!isUser && msg.provider && (
                      <>
                        <span>•</span>
                        <span className="text-[#803F47] font-medium">{msg.provider}</span>
                      </>
                    )}
                    {!isUser && (
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="hover:text-[#54252C] ml-1 transition-colors flex items-center gap-1"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check size={11} className="text-emerald-600" />
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#803F47] text-[#F6F1E9] flex items-center justify-center shrink-0 shadow-2xs mt-1 font-serif text-xs font-semibold">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Loading / Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-3xl mr-auto justify-start animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-[#54252C] text-[#F6F1E9] flex items-center justify-center shrink-0 shadow-2xs mt-1">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-xs bg-white border border-[#D8C8BA] shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#54252C] animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-[#803F47] animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-[#D8C8BA] animate-bounce" />
                <span className="text-xs text-[#292827]/60 ml-2 font-sans font-medium">
                  Thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Banner (Shown when conversation is short) */}
        {messages.length <= 2 && (
          <div className="px-4 py-2.5 bg-[#F6F1E9]/60 border-t border-[#D8C8BA]/60 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-[#54252C] flex items-center gap-1.5 shrink-0 select-none">
                <Sparkles size={13} /> Suggested Prompts:
              </span>
              {SUGGESTED_PROMPTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D8C8BA] text-xs font-medium text-[#292827]/85 hover:bg-[#54252C] hover:text-[#F6F1E9] hover:border-[#54252C] transition-all duration-150 shadow-2xs disabled:opacity-50"
                  >
                    <Icon size={12} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#D8C8BA]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2 sm:gap-3"
          >
            <div className="flex-1 relative rounded-xl border border-[#D8C8BA] bg-[#F6F1E9]/20 focus-within:border-[#54252C] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#54252C] transition-all">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  // auto-expand height up to 120px
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask Shiksha Bot anything... (Press Enter to send, Shift+Enter for new line)"
                className="w-full resize-none bg-transparent px-3.5 py-2.5 text-sm text-[#292827] placeholder-[#292827]/45 focus:outline-none max-h-[120px] font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#54252C] text-[#F6F1E9] font-medium hover:bg-[#803F47] transition-all duration-200 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
            >
              <Send size={16} />
              <span className="hidden sm:inline text-xs font-semibold">Send</span>
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-[#292827]/50 font-sans">
            <span>Enter sends message • Shift+Enter adds newline</span>
            <span>
              Context: {user?.learningPreferences?.targetGoal || "Software Engineering"}
            </span>
          </div>
        </div>
      </div>

      {/* Configuration / AI Integration Status Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-[#292827]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D8C8BA] max-w-lg w-full p-6 shadow-xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8C8BA]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#54252C]/10 text-[#54252C] flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg text-[#292827]">
                    AI Integration Status
                  </h3>
                  <p className="text-xs text-[#292827]/70">
                    Transparent provider configuration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-[#292827]/50 hover:text-[#292827] text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-[#292827]/85 font-sans">
              <div className="p-3.5 rounded-xl bg-[#F6F1E9] border border-[#D8C8BA]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#54252C]">Current Operating Mode:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#803F47]/10 text-[#803F47] border border-[#803F47]/20">
                    {activeProvider.isLive ? "Live Model" : "Educational Demo Engine"}
                  </span>
                </div>
                <p className="text-xs text-[#292827]/75 mt-2 leading-relaxed">
                  {activeProvider.isLive
                    ? "Your assistant is connected to a live multi-turn AI provider."
                    : "Shiksha Bot is currently running on the built-in intelligent knowledge engine. It provides realistic curriculum planning, concept breakdowns, and quizzes for all learning paths without requiring API credits."}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-xs text-[#54252C] uppercase tracking-wider mb-2">
                  How to Enable Live AI (Gemini or OpenAI)
                </h4>
                <p className="text-xs text-[#292827]/75 mb-2 leading-relaxed">
                  To connect Shiksha Bot to Google Gemini or OpenAI GPT models securely, add either key to your server-side environment variables in <code className="bg-[#D8C8BA]/40 px-1.5 py-0.5 rounded text-[#54252C] font-mono text-[11px]">.env.local</code>:
                </p>

                <div className="rounded-lg bg-[#292827] text-[#F6F1E9] p-3 text-xs font-mono">
                  <p className="text-emerald-400"># Google Gemini 1.5 Flash (Recommended)</p>
                  <p>GEMINI_API_KEY=your_gemini_api_key_here</p>
                  <p className="text-emerald-400 mt-2"># Or OpenAI GPT-4o-mini</p>
                  <p>OPENAI_API_KEY=your_openai_api_key_here</p>
                </div>
                <p className="text-[11px] text-[#292827]/60 mt-1.5">
                  🔒 API keys are verified securely on the Next.js server and are never exposed to client-side code.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-[#D8C8BA] flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-lg bg-[#54252C] text-[#F6F1E9] text-xs font-semibold hover:bg-[#803F47] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
