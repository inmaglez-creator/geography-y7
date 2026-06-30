import { useState, useRef, useEffect } from "react";

const TOPICS = [
  {
    id: "maps",
    label: "Maps & Skills",
    icon: "🗺️",
    color: "#0369A1",
    light: "#F0F9FF",
    description: "Map reading, OS maps, grid references & compass",
    topics: ["4 & 6 figure grid references", "Contour lines & relief", "OS map symbols", "Scale & distance"],
  },
  {
    id: "weather",
    label: "Weather & Climate",
    icon: "🌦️",
    color: "#0891B2",
    light: "#ECFEFF",
    description: "Atmosphere, weather systems & climate zones",
    topics: ["Weather vs climate", "Measuring weather", "Clouds & precipitation", "Climate zones of the world"],
  },
  {
    id: "ecosystems",
    label: "Ecosystems",
    icon: "🌿",
    color: "#15803D",
    light: "#F0FDF4",
    description: "Biomes, food chains & human impact",
    topics: ["Biomes of the world", "Food chains & webs", "Tropical rainforests", "Human impact on ecosystems"],
  },
  {
    id: "population",
    label: "Population",
    icon: "🌍",
    color: "#B45309",
    light: "#FFFBEB",
    description: "Population distribution, migration & urbanisation",
    topics: ["Population distribution", "Birth & death rates", "Migration", "Urbanisation"],
  },
];

const SYSTEM_PROMPT = `You are an enthusiastic KS3 Geography tutor for a Year 7 student at a British curriculum school.

Your role:
1. Create engaging geography exercises for KS3 Y7.
2. Use correct geographical terminology and British spelling.
3. Relate topics to real-world examples — places she may know (Spain, Argentina, Europe).
4. Correct answers clearly, explain geographical concepts concisely.
5. Make geography feel exciting — it's about the real world!

When generating questions:
- ONE question at a time (vary: knowledge recall, application, evaluation). After the student answers, give feedback, then ask the next.
- Number clearly: 1. 2. 3.
- 💡 Hints section at end

When correcting:
- ✅ or ❌ per answer
- Explain wrong answers using geographical concepts
- Add a real-world example to reinforce the idea
- End with a "Geography Fact" related to the topic

IMPORTANT FORMATTING RULE: Never use markdown. No asterisks, no hashtags, no backticks. Plain text only. Use numbered lists and emoji where helpful.`;

export default function GeographyApp() {
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeSubtopic, setActiveSubtopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("home");
  const [visitas, setVisitas] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    fetch("/api/visitas")
      .then((r) => r.json())
      .then((d) => setVisitas(d.visitas))
      .catch(() => {});
  }, []);

  const startPractice = async (topic, subtopic) => {
    setActiveTopic(topic); setActiveSubtopic(subtopic); setMessages([]); setMode("chat"); setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: SYSTEM_PROMPT, messages: [{ role: "user", content: `Generate 1 KS3 Geography question on: "${subtopic}" (${topic.label}). Y7 level, bright student.` }] }),
      });
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.content?.[0]?.text || "Error. Try again." }]);
    } catch { setMessages([{ role: "assistant", content: "Connection error." }]); }
    setLoading(false);
  };

  const sendMessage = async (text) => {
    const userMsg = (typeof text === "string" ? text : input).trim(); setInput("");
    if (!userMsg || loading) return;
    const newMessages = [...messages, { role: "user", content: userMsg }]; setMessages(newMessages); setLoading(true);
    const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));
    apiMessages[0] = { role: "user", content: `Geography: ${activeTopic?.label} — ${activeSubtopic}\n\n${apiMessages[0].content}` };
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: SYSTEM_PROMPT, messages: apiMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.content?.[0]?.text || "Error." }]);
    } catch { setMessages([...newMessages, { role: "assistant", content: "Connection error." }]); }
    setLoading(false);
  };

  if (mode === "home") return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🗺️</div>
          <a href="https://y7-hub.vercel.app/" style={{ position: "fixed", top: 12, left: 12, zIndex: 50, background: "#fff", color: "#475569", textDecoration: "none", fontWeight: 700, fontSize: 13, padding: "6px 12px", borderRadius: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", border: "1px solid #e5e7eb" }}>← Hub</a>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0C4A6E", margin: 0 }}>Geography Y7</h1>
          <p style={{ color: "#6B7280", marginTop: 6, fontSize: 15 }}>Explore the world with your AI Geography tutor</p>
        </div>
        {TOPICS.map((topic) => (
          <div key={topic.id} style={{ background: "#fff", borderRadius: 16, marginBottom: 16, border: `2px solid ${topic.light}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ background: topic.light, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>{topic.icon}</span>
              <div><div style={{ fontWeight: 700, fontSize: 17, color: topic.color }}>{topic.label}</div><div style={{ fontSize: 13, color: "#6B7280" }}>{topic.description}</div></div>
            </div>
            <div style={{ padding: "12px 20px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
              {topic.topics.map((sub) => (<button key={sub} onClick={() => startPractice(topic, sub)} style={{ background: topic.color, color: "#fff", border: "none", borderRadius: 20, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{sub}</button>))}
            </div>
          </div>
        ))}
        {visitas !== null && (
          <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#9CA3AF" }}>
            Visitas: {visitas}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: activeTopic.color, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setMode("home")} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>← Back</button>
        <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{activeTopic.label}</div><div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{activeSubtopic}</div></div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", maxWidth: 680, margin: "0 auto", width: "100%" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 16, display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && <div style={{ width: 32, height: 32, borderRadius: "50%", background: activeTopic.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginRight: 8, flexShrink: 0, alignSelf: "flex-end" }}>{activeTopic.icon}</div>}
            <div style={{ background: msg.role === "user" ? activeTopic.color : "#fff", color: msg.role === "user" ? "#fff" : "#1F2937", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "12px 16px", maxWidth: "80%", fontSize: 14, lineHeight: 1.6, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", whiteSpace: "pre-wrap" }}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: activeTopic.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{activeTopic.icon}</div>
            <div style={{ background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map((i) => (<div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: activeTopic.color, animation: "bounce 1s infinite", animationDelay: `${i * 0.2}s` }} />))}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "8px 16px 0", maxWidth: 680, margin: "0 auto", width: "100%", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["More questions", "Explain the concept", "Hint", "Real world example"].map((q) => (
          <button key={q} onClick={() => sendMessage(q)} style={{ background: activeTopic.light, color: activeTopic.color, border: `1px solid ${activeTopic.color}30`, borderRadius: 16, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{q}</button>
        ))}
      </div>
      <div style={{ padding: "12px 16px 20px", maxWidth: 680, margin: "0 auto", width: "100%", display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type your answers or questions..." style={{ flex: 1, border: "2px solid #E5E7EB", borderRadius: 24, padding: "10px 18px", fontSize: 14, outline: "none", fontFamily: "inherit" }} onFocus={(e) => (e.target.style.borderColor = activeTopic.color)} onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")} />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ background: activeTopic.color, color: "#fff", border: "none", borderRadius: "50%", width: 44, height: 44, fontSize: 20, cursor: loading ? "not-allowed" : "pointer", opacity: loading || !input.trim() ? 0.5 : 1, flexShrink: 0 }}>↑</button>
      </div>
      <style>{`@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }`}</style>
    </div>
  );
}
