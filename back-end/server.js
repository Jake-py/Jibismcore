import express from "express";
import fetch from "node-fetch"; // либо встроенный fetch в Node 20+
import cors from "cors";

const app = express();
app.use(cors({
  origin: true, // Allow all origins for local development
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

// Ollama-only endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message" });
    }

    console.log("Using local Ollama API");
    const body = { model: "mistral", prompt: message, stream: false };
    const resp = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
    });
    const cloneTxt = await resp.clone().text();
    if (!resp.ok) {
      return res.status(502).json({ error: `Ollama error: ${cloneTxt}` });
    }
    const data = JSON.parse(cloneTxt);
    const reply = data.response;

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
