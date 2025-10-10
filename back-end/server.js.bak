import express from "express";
import fetch from "node-fetch"; // либо встроенный fetch в Node 20+
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Простая прокси к Ollama
// Ожидает { prompt: string } и возвращает plain text ответ от Ollama
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).send("Invalid prompt");
    }

    // Используем helper для вызова Ollama и автоматического повторного запроса
    const body = { model: "mistral:latest", prompt, stream: false };
    try {
      const resp = await generateWithRetry(body);
      // Read a cloned copy for analysis / safe parsing so we don't consume the main response
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

        const reply = (json && (json.output || json.text || json.response)) || cloneTxt;
        return res.type("text").send(String(reply));
      }

      return res.type("text").send(cloneTxt);
    } catch (err) {
      console.error("/ask proxy error (generateWithRetry):", err);
      return res.status(500).send("Internal server error");
    }
  } catch (err) {
    console.error("/ask proxy error:", err);
    return res.status(500).send("Internal server error");
  }
});

// Новый JSON-эндпоинт для использования конкретной модели llama3:latest
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Invalid prompt" });
    }

    const basePath = process.env.OLLAMA_BASE_PATH || "";
    // Keep model consistent with other endpoints (mistral:latest)
    const body = { model: "mistral:latest", prompt, stream: false };
    try {
      const resp = await generateWithRetry(body);
      // read cloned text for safe parsing
      const cloneTxt = await resp.clone().text();
      if (!resp.ok) {
        return res.status(502).json({ error: `Ollama error: ${cloneTxt}` });
      }

      const contentType = resp.headers.get("content-type") || "";
      let reply = cloneTxt;
      if (contentType.includes("application/json")) {
        try {
          const data = JSON.parse(cloneTxt);
          reply = data.response || data.output || data.text || JSON.stringify(data);
        } catch (e) {
          // fallback to resp.json
          try {
            const data = await resp.json();
            reply = data.response || data.output || data.text || JSON.stringify(data);
          } catch (e2) {
            reply = cloneTxt;
          }
        }
      }

      const usedBase = process.env.OLLAMA_BASE_PATH || "";
      // Content negotiation: return plain text by default so front-end that
      // expects raw text (OllamaChat.jsx) continues to work. If the client
      // explicitly requests JSON (Accept: application/json) return JSON.
      const accept = (req.get("accept") || "").toLowerCase();
      if (accept.includes("application/json")) {
        return res.json({ reply, basePath: usedBase });
      }

      return res.type("text").send(String(reply));
    } catch (err) {
      console.error("/api/chat error (generateWithRetry):", err);
      return res.status(500).json({ error: "Ollama не отвечает" });
    }
  } catch (err) {
    console.error("/api/chat error:", err);
    return res.status(500).json({ error: "Ollama не отвечает" });
  }
});

// Helper: call Ollama /api/generate, detect public base URL suggestion and retry once
async function generateWithRetry(body) {
  const host = "http://localhost:11434";
  // Read configured basePath from env (may be empty)
  const basePathRaw = process.env.OLLAMA_BASE_PATH || "";

  const normalizePath = (p) => {
    if (!p) return "";
    const withLeading = p.startsWith("/") ? p : `/${p}`;
    // remove trailing slash
    return withLeading.replace(/\/$/, "");
  };

  const basePath = normalizePath(basePathRaw);
  console.log(`[Ollama Helper] Using base path: ${basePath}`);

  const doFetchWith = async (bp) => {
    const bpNorm = normalizePath(bp);
    const url = `${host}${bpNorm}/api/generate`;
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  // first attempt with configured basePath
  let resp = await doFetchWith(basePath);
  if (resp.ok) return resp;

  // read cloned response body for analysis (so we don't consume original stream unexpectedly)
  const txt = await resp.clone().text();

  // flexible regex to detect variants like /Jibismcore/ or /Jibismcore (with or without quotes)
  // matches phrases that mention public base URL or public base path and captures a leading "/..." path
  const suggestRe = /public\s+base\s+(?:URL|path)\s*(?:of|is)?\s*[:\-]?\s*['"]?(\/[A-Za-z0-9_\-\/]+)['"]?/i;
  const m = txt.match(suggestRe);
  if (m && m[1]) {
    const detected = normalizePath(m[1]);
    if (detected !== basePath) {
      // do not persist detected value to env (avoids forcing '/Jibismcore')
      console.log(`[Ollama Helper] Retrying request with detected base path (transient): ${detected}`);
      // retry exactly once with detected base path (transient)
      resp = await doFetchWith(detected);
      return resp;
    }
  }

  // Also try a more generic detection: if response mentions a path like /Jibismcore anywhere
  const genericRe = /(\/[A-Za-z0-9_\-]+)(?:\/)?/g;
  let detectedCandidate = null;
  let gm;
  while ((gm = genericRe.exec(txt)) !== null) {
    const cand = normalizePath(gm[1]);
    // ignore empty and root
    if (cand && cand !== "" && cand !== "/") {
      // prefer candidate that includes non-trivial name (not just /api)
      if (!cand.startsWith("/api") && cand.length > 1) {
        detectedCandidate = cand;
        break;
      }
      // otherwise keep first seen
      if (!detectedCandidate) detectedCandidate = cand;
    }
  }

  if (detectedCandidate && detectedCandidate !== basePath) {
    console.log(`[Ollama Helper] Retrying request with detected base path (generic, transient): ${detectedCandidate}`);
    resp = await doFetchWith(detectedCandidate);
    return resp;
  }

  // no auto-fix available — throw error with text for caller
  const err = new Error(`Ollama error: ${txt}`);
  err.statusText = txt;
  throw err;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
