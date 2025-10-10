# back-end bridge (Ollama proxy)

Этот небольшой мост проксирует запросы от фронтенда к локально запущенному Ollama (по умолчанию http://localhost:11434).

Как запустить:

1. Убедитесь, что Ollama запущен локально и доступен на порту 11434.
2. В каталоге back-end выполните:

```bash
npm install
npm start
```

Если Ollama настроен с публичным базовым путём (public base URL), например `/Jibismcore`, установите переменную окружения для моста:

```bash
# If you need to set OLLAMA_BASE_PATH for special deployments, set it explicitly.
# Do NOT set it to '/Jibismcore' by default in this repository.
npm start
```

Пример запроса к новому JSON endpoint `/api/chat`:

```bash
curl -s -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"prompt":"Привет"}' | jq
```

3. По умолчанию сервер слушает порт 3000 и предоставляет маршрут `POST /ask`.

Формат запроса:

POST /ask
Content-Type: application/json

Body: { "prompt": "текст вопроса" }

Ответ: plain text с ответом модели или текст ошибки.

Если вы хотите изменить URL, по которому фронтенд обращается к мосту, установите переменную окружения Vite `VITE_ASK_URL` в проекте `front-end`.
