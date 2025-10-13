# Deployment Fixes for Render

## Steps from Approved Plan

- [x] Step 1: Edit back-end/server.js - Add a simple GET / route to return 'Backend is alive' and prevent 404 on root access.
- [x] Step 2: Edit front-end/vite.config.js - Add production build configurations to avoid CSP 'eval' blocks: define empty process.env, remove legal comments, and enable minification.
- [x] Step 3: Provide instructions for Render environment setup - Set VITE_ASK_URL to "https://<your-backend-name>.onrender.com/api/chat" (replace <your-backend-name> with actual Render back-end service name, e.g., jibismcore-backend).
- [ ] Step 4: Build and redeploy - Run `npm run build` in front-end, deploy dist/ to Render front-end service; redeploy back-end service.
- [ ] Step 5: Test - Verify API calls from front-end to back-end, root route on back-end, and no CSP errors in browser console.

# Ollama Chat UI Changes

- [x] Step 1: Edit front-end/src/components/OllamaChat.jsx - Change main container and header background from bg-orange-600 to bg-gray-600.
- [x] Step 2: Edit front-end/src/components/OllamaChat.jsx - Change "Ollama Chat" label color from text-black to text-orange-500.
- [x] Step 3: Confirm position is already right-aligned; no changes needed.
- [ ] Step 4: Test UI changes locally with npm run dev.
