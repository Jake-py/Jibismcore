import express from "express";
import fetch from "node-fetch"; // либо встроенный fetch в Node 20+
import cors from "cors";

const app = express();
app.use(cors({
  origin: 'https://jibismcore.onrender.com', // Allow requests from the front-end domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Root route to avoid 404 on /
app.get('/', (req, res) => {
  res.send('Backend is alive');
});

// Простая прокси к Ollama
// Ожидает { prompt: string } и возвращает plain text ответ от Ollama
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).send("Invalid prompt");
    }

    // Используем helper для вызова Ollama Cloud API
    const body = { model: "llama3.1", messages: [{ role: "user", content: prompt }] };
    try {
      const resp = await fetch("https://api.ollama.com/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OLLAMA_API_KEY}`
        },
        body: JSON.stringify(body),
      });
      const cloneTxt = await resp.clone().text();
      if (!resp.ok) {
        return res.status(502).send(`Ollama error: ${cloneTxt}`);
      }

      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        let json = null;
        try {
          json = JSON.parse(cloneTxt);
        } catch (e) {
          // fallback to resp.json() if parsing failed for any reason
          try {
            json = await resp.json();
          } catch (e2) {
            json = null;
          }
        }

        const reply = (json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) || cloneTxt;
        return res.type("text").send(String(reply));
      }

      return res.type("text").send(cloneTxt);
    } catch (err) {
      console.error("/ask proxy error:", err);
      return res.status(500).send("Internal server error");
    }
  } catch (err) {
    console.error("/ask proxy error:", err);
    return res.status(500).send("Internal server error");
  }
});

// Новый JSON-эндпоинт с резервированием между Ollama и OpenAI
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message" });
    }

    // Функция для вызова Ollama
    const callOllama = async () => {
      console.log("Используется Ollama API");
      const body = { model: "llama3.1", messages: [{ role: "user", content: message }] };
      const resp = await fetch("https://api.ollama.com/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OLLAMA_API_KEY}`
        },
        body: JSON.stringify(body),
      });
      const cloneTxt = await resp.clone().text();
      if (!resp.ok) {
        throw new Error(`Ollama error: ${cloneTxt}`);
      }
      const data = JSON.parse(cloneTxt);
      return data.choices[0].message.content;
    };

    // Функция для вызова OpenAI
    const callOpenAI = async () => {
      console.log("Переключено на OpenAI fallback");
      const body = { model: "gpt-4o-mini", messages: [{ role: "user", content: message }] };
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify(body),
      });
      const cloneTxt = await resp.clone().text();
      if (!resp.ok) {
        throw new Error(`OpenAI error: ${cloneTxt}`);
      }
      const data = JSON.parse(cloneTxt);
      return data.choices[0].message.content;
    };

    let reply;
    try {
      reply = await callOllama();
    } catch (ollamaErr) {
      console.error("Ollama failed:", ollamaErr.message);
      try {
        reply = await callOpenAI();
      } catch (openaiErr) {
        console.error("OpenAI fallback failed:", openaiErr.message);
        return res.status(500).json({ error: "Both Ollama and OpenAI failed" });
      }
    }

    // Content negotiation: return plain text by default so front-end that
    // expects raw text (OllamaChat.jsx) continues to work. If the client
    // explicitly requests JSON (Accept: application/json) return JSON.
    const accept = (req.get("accept") || "").toLowerCase();
    if (accept.includes("application/json")) {
      return res.json({ reply });
    }

    return res.type("text").send(String(reply));
  } catch (err) {
    console.error("/api/chat error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
