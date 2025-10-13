import React, { useState, useRef, useEffect } from "react";

export default function OllamaChat({ askUrl, isOpen, onToggle }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // {role:'user'|'assistant', text}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Resolve askUrl: prefer prop, otherwise use VITE_ASK_URL if provided,
  // otherwise fall back to the fixed 'http://localhost:3000/api/chat' path. This avoids
  // accidentally using a build-time BASE_URL like '/Jibismcore/'.
  const resolvedAskUrl = (() => {
    if (askUrl) return askUrl;
    const viteAsk = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ASK_URL) ? import.meta.env.VITE_ASK_URL : null;
    return viteAsk || "http://localhost:3000/api/chat";
  })();

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(resolvedAskUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      let text;
      if (!res.ok) {
        // attempt to read and parse body safely and include status for better debugging
        let bodyText = "";
        try {
          const ct = (res.headers.get("content-type") || "").toLowerCase();
          if (ct.includes("application/json")) {
            try {
              const json = await res.json();
              // prefer common fields
              bodyText = json.error || json.reply || json.response || json.message || JSON.stringify(json);
            } catch (e) {
              // fallback to text
              bodyText = await res.text();
            } 
          } else {
            bodyText = await res.text();
          }
        } catch (e) {
          bodyText = `<unable to read body: ${e.message}>`;
        }
        const status = `${res.status} ${res.statusText || ""}`.trim();
        const hdr = {};
        try {
          res.headers.forEach((v, k) => (hdr[k] = v));
        } catch (e) {
          // ignore header iteration errors
        }
        const details = `Request URL: ${resolvedAskUrl}\nStatus: ${status}\nBody: ${bodyText}`;
        console.error("OllamaChat request failed:", { url: resolvedAskUrl, status: res.status, statusText: res.statusText, headers: hdr, body: bodyText });

        // Give a helpful hint when 404 — likely wrong URL or proxy not running
        let hint = "";
        if (res.status === 404) {
          hint = `\n
Подсказка: сервер вернул 404. Убедитесь, что прокси (back-end/server.js) запущен и что фронтенд обращается к правильному URL. Например, при локальной разработке установите VITE_ASK_URL в ` +
            "http://localhost:3000/api/chat" + ` или запустите мост на порту 3000.`;
        }

        text = `Server error: ${bodyText}${hint}`;
        // also set error state for UI
        setError(details + hint);
      } else {
        text = await res.text();
      }

      setMessages((m) => [...m, { role: "assistant", text }]);
    } catch (e) {
      setError(e.message || String(e));
      setMessages((m) => [...m, { role: "assistant", text: `Request failed: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed top-[40px] right-[50px] h-[80vh] ${isOpen ? 'w-50' : 'w-12'} bg-gray-600 border-2 border-black shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-72'
      }`}
    >
      {/* Header */}
      <div className="p-4 bg-gray-600 flex items-center justify-between border-b border-black">
        {isOpen && <div className="flex items-center gap-3">
          <img src="/Ollama_icon.png" alt="O" className="w-6 h-6" />
          <strong className="text-orange-500">Ollama Chat</strong>
        </div>}
        <div className="flex gap-2">
          <button
            onClick={onToggle}
            disabled={isOpen}
            className="text-black hover:text-gray-600 px-2 py-1 rounded disabled:opacity-50"
            title="Открыть чат"
          >
            ☢️
          </button>
          <button
            onClick={onToggle}
            disabled={!isOpen}
            className="text-black hover:text-gray-600 px-2 py-1 rounded disabled:opacity-50"
            title="Закрыть чат"
          >
            ❌
          </button>
        </div>
      </div>

      {/* Messages */}
      {isOpen && <div ref={messagesRef} className="flex-1 p-4 overflow-auto space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm border border-black ${
                m.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-orange-200 text-black rounded-bl-none"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {error && <div className="text-red-400 text-sm bg-red-900 bg-opacity-50 p-2 rounded">{error}</div>}
      </div>}

      {/* Input */}
      {isOpen && <div className="pb-5 pt-4 px-4 bg-orange-600 border-t border-black">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder="Спроси Ollama..."
            className="flex-1 px-3 py-2 bg-white text-black rounded-full border border-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={send}
            disabled={loading}
            className="px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "➤"}
          </button>
        </div>
      </div>}
    </div>
  );
}
