// app/components/chatbot/ChatbotWidget.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MdClose,
  MdChevronRight,
  MdSearch,
  MdSupportAgent,
  MdShoppingBag,
  MdHelp,
  MdLightbulb,
  MdStar,
  MdPerson,
  MdSmartToy,
  MdChat,
} from "react-icons/md";
import { chatbotApi } from "../../../lib/api/chatbot";
import type {
  IChatbotConfig,
  IChatbotQA,
  ChatMessage,
} from "../../../types/chatbot.types";
import JoditHtmlContent from "../shared/JoditHtmlContent";

// ── Avatar icon map: matches AVATAR_OPTIONS in ChatbotConfigPanel ──
function AvatarIcon({ value, size = 16 }: { value: string; size?: number }) {
  const icons: Record<string, React.ReactNode> = {
    "💬": <MdChat size={size} />,
    "🤖": <MdSmartToy size={size} />,
    "🛍️": <MdShoppingBag size={size} />,
    "❓": <MdHelp size={size} />,
    "💡": <MdLightbulb size={size} />,
    "🎯": <MdSupportAgent size={size} />,
    "⭐": <MdStar size={size} />,
    "🙋": <MdPerson size={size} />,
  };
  return <>{icons[value] ?? <MdSupportAgent size={size} />}</>;
}

export default function ChatbotWidget() {
  const [config, setConfig] = useState<IChatbotConfig | null>(null);
  const [questions, setQuestions] = useState<
    Pick<IChatbotQA, "_id" | "question" | "category" | "sort_order">[]
  >([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [questionsExpanded, setQuestionsExpanded] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      try {
        const [configRes, qaRes] = await Promise.all([
          chatbotApi.getConfig(),
          chatbotApi.getVisibleQAs(),
        ]);
        setConfig(configRes.config);
        setQuestions(qaRes.qas || []);
      } catch (err) {
        console.error("Chatbot init failed:", err);
      }
    }
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (messages.length === 0 && config) {
      setMessages([
        {
          id: `bot-welcome-${Date.now()}`,
          type: "bot",
          content: config.welcome_message,
          isHtml: false,
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages.length, config]);

  const handleQuestionClick = async (qa: { _id: string; question: string }) => {
    if (loadingAnswer) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: "user",
        content: qa.question,
        isHtml: false,
        timestamp: new Date(),
      },
    ]);
    setLoadingAnswer(qa._id);
    try {
      const { qa: full } = await chatbotApi.getQAAnswer(qa._id);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          type: "bot",
          content: full.answer,
          isHtml: true,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          type: "bot",
          content: config?.fallback_message || "Something went wrong.",
          isHtml: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoadingAnswer(null);
    }
  };

  const handleClose = () => setIsOpen(false);

  if (!config || !config.is_enabled || questions.length === 0) return null;

  const primaryColor = config.primary_color || "#6366f1";
  const posRight = config.position !== "bottom-left";

  const categories = [
    "all",
    ...Array.from(new Set(questions.map((q) => q.category))),
  ];

  const filtered = questions.filter((q) => {
    const matchCat =
      selectedCategory === "all" || q.category === selectedCategory;
    const matchSearch =
      !searchTerm ||
      q.question.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const hasMessages = messages.length > 0;

  return (
    <>
      <div
        className={`fixed z-[9999] ${posRight ? "right-4 sm:right-16 bottom-4 sm:bottom-5" : "left-4 sm:left-16 bottom-4 sm:bottom-5"}`}
      >
        {/* ── Chat Window ── */}
        <div
          className={`absolute ${posRight ? "right-0" : "left-0"} bottom-[50px] transition-all duration-300 ease-out ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 translate-y-3 pointer-events-none"
          }`}
          style={{
            transformOrigin: posRight ? "bottom right" : "bottom left",
            width: "min(360px, calc(100vw - 20px))",
          }}
          aria-hidden={!isOpen}
        >
          <div
            className="flex flex-col bg-white dark:bg-gray-950 rounded-2xl overflow-hidden border border-gray-200/80 dark:border-gray-800"
            style={{
              height: "min(540px, calc(100vh - 90px))",
              boxShadow:
                "0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 60px -10px rgba(0,0,0,0.18)",
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-white">
                <AvatarIcon value={config.avatar_icon} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-[13px] leading-tight truncate">
                  {config.bot_name}
                </p>
                <p className="text-white/60 text-[10px] leading-none mt-0.5 flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"
                    style={{ boxShadow: "0 0 0 2px rgba(52,211,153,0.3)" }}
                  />
                  {loadingAnswer ? "Typing…" : "Online · Instant answers"}
                </p>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors flex-shrink-0"
              >
                <MdClose size={14} />
              </button>
            </div>

            {/* ── Chat Messages Area ── */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-0 scrollbar-hide"
              style={
                {
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                } as React.CSSProperties
              }
            >
              {!hasMessages && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-2 pb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}18` }}
                  >
                    <AvatarIcon value={config.avatar_icon} size={20} />
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed max-w-[200px]">
                    {config.welcome_message}
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.type === "bot" && (
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{
                        backgroundColor: `${primaryColor}20`,
                        color: primaryColor,
                      }}
                    >
                      <AvatarIcon value={config.avatar_icon} size={11} />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3 py-2 text-[11.5px] leading-relaxed ${
                      msg.type === "user"
                        ? "rounded-br-sm text-white"
                        : "rounded-bl-sm bg-gray-100 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200"
                    }`}
                    style={
                      msg.type === "user"
                        ? { backgroundColor: primaryColor }
                        : {}
                    }
                  >
                    {msg.isHtml ? (
                      <div className="chatbot-html-content">
                        <JoditHtmlContent content={msg.content} />
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                    <p
                      className={`text-[9px] mt-1 ${
                        msg.type === "user"
                          ? "text-white/50 text-right"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {loadingAnswer && (
                <div className="flex justify-start gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor,
                    }}
                  >
                    <AvatarIcon value={config.avatar_icon} size={11} />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800/80 rounded-2xl rounded-bl-sm px-3 py-2.5">
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.13}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Questions Panel ── */}
            <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800/80">
              {/* Panel Toggle Header */}
              <button
                onClick={() => setQuestionsExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 tracking-wide uppercase">
                    Suggested Questions
                  </span>
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {questions.length > 9 ? "9+" : questions.length}
                  </span>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                    questionsExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Collapsible Body */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  questionsExpanded ? "max-h-[180px]" : "max-h-0"
                }`}
              >
                {/* Search — only when >5 questions */}
                {questions.length > 5 && (
                  <div className="px-3 pb-1.5">
                    <div className="relative">
                      <MdSearch
                        size={13}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search questions…"
                        className="w-full pl-7 pr-3 py-1.5 text-[11px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:border-gray-300 dark:focus:border-gray-600 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Category tabs — only when multiple categories and no search */}
                {categories.length > 2 && !searchTerm && (
                  <div
                    className="flex gap-1 px-3 pb-1.5 overflow-x-auto scrollbar-hide"
                    style={
                      {
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      } as React.CSSProperties
                    }
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex-shrink-0 px-2.5 py-0.5 text-[10px] font-medium rounded-full border transition-colors whitespace-nowrap ${
                          selectedCategory === cat
                            ? "text-white border-transparent"
                            : "text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                        style={
                          selectedCategory === cat
                            ? {
                                backgroundColor: primaryColor,
                                borderColor: primaryColor,
                              }
                            : {}
                        }
                      >
                        {cat === "all" ? "All" : cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Question list */}
                <div
                  className="overflow-y-auto scrollbar-hide"
                  style={
                    {
                      maxHeight: questions.length > 5 ? "110px" : "150px",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    } as React.CSSProperties
                  }
                >
                  {filtered.length === 0 ? (
                    <p className="text-[11px] text-gray-400 text-center py-4">
                      No questions found.
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-100/80 dark:divide-gray-800/80">
                      {filtered.map((qa) => (
                        <button
                          key={qa._id}
                          onClick={() => handleQuestionClick(qa)}
                          disabled={!!loadingAnswer}
                          className="w-full text-left px-4 py-2 flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors disabled:opacity-40 group"
                        >
                          <MdChevronRight
                            size={13}
                            className="flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                            style={{ color: primaryColor }}
                          />
                          <span className="flex-1 text-[11px] text-gray-700 dark:text-gray-300 leading-snug line-clamp-1">
                            {qa.question}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Branding */}
            {config.show_branding && (
              <div className="flex-shrink-0 py-1.5 text-center border-t border-gray-100 dark:border-gray-800">
                <p className="text-[9px] text-gray-400 dark:text-gray-600">
                  Powered by{" "}
                  <span
                    className="font-semibold"
                    style={{ color: primaryColor }}
                  >
                    ShopBot
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FAB */}
        <button
          onClick={isOpen ? handleClose : handleOpen}
          aria-label={isOpen ? "Close chat" : `Open ${config.bot_name}`}
          style={{ backgroundColor: primaryColor }}
          className="relative w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all duration-150 focus:outline-none"
        >
          <span
            className={`absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200 ${
              isOpen ? "opacity-0 scale-90" : "opacity-100 scale-100"
            }`}
          >
            <AvatarIcon value={config.avatar_icon} size={22} />
          </span>
          <span
            className={`absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200 ${
              isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <MdClose size={22} />
          </span>
          {!isOpen && questions.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-red-500 border-2 border-white text-[9px] font-bold flex items-center justify-center text-white">
              {questions.length > 9 ? "9+" : questions.length}
            </span>
          )}
        </button>
      </div>

      <style jsx global>{`
        .chatbot-html-content,
        .chatbot-html-content * {
          font-size: 11.5px !important;
          line-height: 1.55 !important;
        }
        .chatbot-html-content p {
          margin: 0 0 3px 0 !important;
          padding: 0 !important;
        }
        .chatbot-html-content p:last-child {
          margin-bottom: 0 !important;
        }
        .chatbot-html-content ul,
        .chatbot-html-content ol {
          margin: 3px 0 !important;
          padding-left: 14px !important;
        }
        .chatbot-html-content li {
          margin-bottom: 1px !important;
          padding: 0 !important;
        }
        .chatbot-html-content a {
          text-decoration: underline;
          color: inherit;
          opacity: 0.85;
        }
        .chatbot-html-content a:hover {
          opacity: 1;
        }
        .chatbot-html-content strong,
        .chatbot-html-content b {
          font-weight: 600 !important;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
