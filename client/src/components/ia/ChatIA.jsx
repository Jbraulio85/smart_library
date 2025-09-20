import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useChatWithDocument } from "../../shared/hooks/useChatWithDocument";
import { useHistoryIA } from "../../shared/hooks/useHistoryIA";
import { useCleanHistoryIA } from "../../shared/hooks/useCleanHistoryIA";
import { FormattedAIAnswer } from "./FormattedAIAnswer";

export function ChatIA({ pdfUrl, user }) {
  const [question, setQuestion] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const scrollRef = useRef(null);

  const chat        = useChatWithDocument(pdfUrl);
  const historyHook = useHistoryIA(pdfUrl);
  const cleanHook   = useCleanHistoryIA(pdfUrl);
  const allHistory  = [...historyHook.history, ...chat.history];

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [allHistory.length, chat.loading]);

  // 1) Prevenir copiar/pegar y menú contextual
  useEffect(() => {
    const root = scrollRef.current?.parentNode;
    if (!root) return;

    const prevent = e => e.preventDefault();
    root.addEventListener("copy",        prevent);
    root.addEventListener("cut",         prevent);
    root.addEventListener("contextmenu", prevent);
    root.style.userSelect        = "none";
    root.style.webkitUserSelect  = "none";

    return () => {
      root.removeEventListener("copy",        prevent);
      root.removeEventListener("cut",         prevent);
      root.removeEventListener("contextmenu", prevent);
      root.style.userSelect        = "";
      root.style.webkitUserSelect  = "";
    };
  }, []);

  // 2) Vaciar portapapeles al PrintScreen
  useEffect(() => {
    const onKeyUp = async e => {
      if (e.key === "PrintScreen") {
        try { await navigator.clipboard.writeText(""); } catch {}
      }
    };
    document.addEventListener("keyup", onKeyUp);
    return () => document.removeEventListener("keyup", onKeyUp);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    const text = question.trim();
    if (!text) return;
    await chat.askDocument({ question: text });
    setQuestion("");
  };

  const handleClear = async () => {
    setIsClearing(true);
    await new Promise(r => setTimeout(r, 300));
    const ok = await cleanHook.clearHistory();
    if (ok) {
      chat.resetAnswer();
      historyHook.refetchHistory();
    }
    setIsClearing(false);
  };

  return (
    <div className="flex flex-col h-full p-4 min-h-0 bg-white rounded-b-2xl shadow-lg">
      {/* Input y botón */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          className="flex-1 p-3 rounded-2xl shadow bg-gray-100 focus:outline-none"
          placeholder="Pregunta lo que quieras"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          disabled={chat.loading}
        />
        <button
          type="submit"
          disabled={chat.loading || !question.trim()}
          className="bg-[#800020] text-white font-medium px-4 py-2 rounded-2xl disabled:opacity-50 flex items-center justify-center"
        >
          {chat.loading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          ) : (
            "Preguntar"
          )}
        </button>
      </form>

      {/* Chat history */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence initial={false}>
          {!isClearing &&
            allHistory.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-2 px-2 pb-2"
              >
                <ChatBubble question={msg.question} answer={msg.answer} user={user} />
              </motion.div>
            ))}
        </AnimatePresence>
        {historyHook.loadingHistory && <p className="text-gray-500 px-2">Cargando historial…</p>}
        {historyHook.errorHistory   && <p className="text-red-500 px-2">{historyHook.errorHistory}</p>}
        {chat.error                 && <p className="text-red-500 px-2">{chat.error}</p>}
        {cleanHook.error            && <p className="text-red-500 px-2">{cleanHook.error}</p>}
      </div>

      {/* Botón limpiar */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={handleClear}
          disabled={cleanHook.loading || isClearing}
          className="disabled:opacity-50"
          title="Borrar historial"
        >
          <TrashIcon className="w-8 h-8 text-gray-400 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
}

ChatIA.propTypes = {
  pdfUrl: PropTypes.string.isRequired,
  user:   PropTypes.shape({ profilePicture: PropTypes.string }).isRequired,
};

function ChatBubble({ question, answer, user }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-end items-center gap-2">
        <span className="bg-gray-100 px-3 py-1 rounded-2xl">{question}</span>
        <img
          src={user.profilePicture}
          alt="Perfil"
          className="w-8 h-8 rounded-full object-cover"
        />
      </div>
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 bg-white shadow rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-[#800020]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <rect x="4" y="8" width="16" height="10" rx="4" strokeWidth="2" />
            <circle cx="8" cy="14" r="1" />
            <circle cx="16" cy="14" r="1" />
          </svg>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-2xl shadow flex-1">
          <FormattedAIAnswer answer={answer} />
        </div>
      </div>
    </div>
  );
}

ChatBubble.propTypes = {
  question: PropTypes.string.isRequired,
  answer:   PropTypes.string.isRequired,
  user:     PropTypes.shape({ profilePicture: PropTypes.string }).isRequired,
};
