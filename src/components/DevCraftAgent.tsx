"use client";

import { useEffect, useRef, useState } from "react";

const SYSTEM_PROMPT = `Tu es l'assistant IA de Dev Craft, une agence web freelance en Île-de-France. Tu es un assistant généraliste intelligent qui peut répondre à toutes les questions : web, code, design, SEO, business, questions générales, etc.

En plus de répondre aux questions générales, tu connais aussi les services Dev Craft :
- Site vitrine (à partir de 299€)
- Site e-commerce (à partir de 599€)
- Landing page (à partir de 149€)
- Refonte (à partir de 199€)
- Maintenance (à partir de 49€/mois)

Règles :
- Réponds toujours en français
- Sois concis, clair, utile
- Si la question touche aux services Dev Craft, propose naturellement de passer à l'action (contact@dev-craft.store)
- Tu peux coder, expliquer, conseiller, analyser — tu es vraiment généraliste
- Max 4 phrases par réponse sauf si du code est demandé`;

const STARTERS = ["C'est quoi React ?", "Combien coûte un site ?", "Explique-moi le SEO", "Comment faire une API REST ?"];

type Message = { role: "user" | "assistant"; content: string };

export default function DevCraftAgent() {
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDot, setShowDot] = useState(false);
  const [showStarters, setShowStarters] = useState(false);
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowDot(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function openChat() {
    setOpen(true);
    setShowDot(false);
    if (!opened) {
      setOpened(true);
      setLoading(true);
      await new Promise((r) => setTimeout(r, 900));
      setLoading(false);
      const welcome =
        "Bonjour ! Je suis l'assistant IA de Dev Craft. Je peux t'aider sur n'importe quel sujet : web, code, design, SEO, ou simplement répondre à tes questions. Par où on commence ?";
      setMessages([{ role: "assistant", content: welcome }]);
      setShowStarters(true);
    }
  }

  async function send(text: string) {
    const txt = text.trim();
    if (!txt || loading) return;
    setShowStarters(false);
    const newHistory: Message[] = [...messages, { role: "user", content: txt }];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      // Proxy serveur : ne jamais appeler Anthropic directement depuis le client
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newHistory,
        }),
      });
      const data = await res.json();
      const reply =
        data.content?.map((b: { text?: string }) => b.text || "").join("") ||
        "Désolé, une erreur s'est produite.";
      setMessages([...newHistory, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newHistory, { role: "assistant", content: "Erreur de connexion. Réessaie dans un instant." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        fontFamily: "'Sora', sans-serif",
      }}
    >
      {/* Chat window */}
      {open && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 370,
            height: 540,
            background: "white",
            border: "0.5px solid #e5e5e5",
            borderRadius: 20,
            overflow: "hidden",
            marginBottom: 12,
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#111",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 13,
                color: "#111",
                flexShrink: 0,
              }}
            >
              DC
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Dev Craft AI</div>
              <div style={{ color: "#888", fontSize: 11, marginTop: 1 }}>Assistant · En ligne</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#888",
                fontSize: 22,
                cursor: "pointer",
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            ref={msgsRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  maxWidth: "82%",
                  padding: "10px 14px",
                  borderRadius: 16,
                  fontSize: 13,
                  lineHeight: 1.55,
                  ...(m.role === "assistant"
                    ? { background: "#f5f5f5", color: "#111", borderBottomLeftRadius: 4, alignSelf: "flex-start" }
                    : { background: "#111", color: "#fff", borderBottomRightRadius: 4, alignSelf: "flex-end" }),
                }}
              >
                {m.content}
              </div>
            ))}

            {/* Quick starters */}
            {showStarters && !loading && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                {STARTERS.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setShowStarters(false);
                      send(q);
                    }}
                    style={{
                      background: "none",
                      border: "0.5px solid #ccc",
                      borderRadius: 20,
                      padding: "5px 12px",
                      fontSize: 11,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      color: "#111",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#f5f5f5",
                  borderRadius: 16,
                  borderBottomLeftRadius: 4,
                  padding: "12px 16px",
                  display: "flex",
                  gap: 5,
                }}
              >
                {[0, 180, 360].map((delay) => (
                  <span
                    key={delay}
                    style={{
                      width: 7,
                      height: 7,
                      background: "#aaa",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: `bounce 1.1s ${delay}ms infinite`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: "10px 12px",
              borderTop: "0.5px solid #e5e5e5",
              display: "flex",
              gap: 8,
              alignItems: "flex-end",
              flexShrink: 0,
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Pose ta question..."
              rows={1}
              style={{
                flex: 1,
                border: "0.5px solid #e5e5e5",
                borderRadius: 12,
                padding: "9px 13px",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
                resize: "none",
                background: "#f9f9f9",
                color: "#111",
                maxHeight: 90,
                lineHeight: 1.5,
              }}
            />
            <button
              onClick={() => send(input)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#111",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={open ? () => setOpen(false) : openChat}
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "#111",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.22)",
          transition: "transform 0.2s",
          position: "relative",
        }}
      >
        {showDot && !open && (
          <span
            style={{
              position: "absolute",
              top: 1,
              right: 1,
              width: 14,
              height: 14,
              background: "#e24b4a",
              borderRadius: "50%",
              border: "2px solid white",
            }}
          />
        )}
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

