import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { generateRegexWithGrok } from './server/grok.js';
import { generateRegexWithGemini, generateDocSpecWithGemini } from './server/gemini.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Check API keys configuration status
  app.get('/api/config', (_req, res) => {
    const xaiKey = process.env.XAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const hasXaiKey = Boolean(xaiKey && xaiKey.trim() !== '' && xaiKey !== 'xai-...');
    const hasGeminiKey = Boolean(geminiKey && geminiKey.trim() !== '' && geminiKey !== 'MY_GEMINI_API_KEY');
    res.json({
      hasKey: hasXaiKey || hasGeminiKey,
      hasXaiKey,
      hasGeminiKey,
      defaultEngine: hasGeminiKey ? 'gemini' : (hasXaiKey ? 'grok' : 'none'),
    });
  });

  // Generate Regex endpoint (supports both Gemini and Grok)
  app.post('/api/generate-regex', async (req, res) => {
    try {
      const { description, flags, engine } = req.body;
      if (!description || typeof description !== 'string' || !description.trim()) {
        res.status(400).json({ error: 'Description is required' });
        return;
      }

      const xaiKey = process.env.XAI_API_KEY;
      const hasXai = Boolean(xaiKey && xaiKey.trim() !== '' && xaiKey !== 'xai-...');
      const geminiKey = process.env.GEMINI_API_KEY;
      const hasGemini = Boolean(geminiKey && geminiKey.trim() !== '' && geminiKey !== 'MY_GEMINI_API_KEY');

      // Prefer explicit engine or smart auto-selection based on configured keys
      const useGemini = engine === 'gemini' || (!hasXai && hasGemini);

      let result;
      if (useGemini) {
        result = await generateRegexWithGemini(description.trim(), flags || 'g');
      } else {
        result = await generateRegexWithGrok(description.trim(), flags || 'g');
      }
      res.json(result);
    } catch (err: any) {
      if (err.message === 'XAI_API_KEY_MISSING' || err.message === 'GEMINI_API_KEY_MISSING') {
        res.status(400).json({
          error: err.message,
          message:
            'API Key is not configured on the server. Please check your environment configuration.',
        });
        return;
      }

      console.error('Server error in /api/generate-regex:', err.message);
      res.status(err.statusCode || 500).json({
        error: 'API_ERROR',
        message: err.message || 'An unexpected error occurred generating regex.',
      });
    }
  });

  // Generate Documentation Template Spec with Gemini
  app.post('/api/gemini/generate-doc', async (req, res) => {
    try {
      const { pattern, flags, description } = req.body;
      if (!pattern || typeof pattern !== 'string') {
        res.status(400).json({ error: 'Pattern string is required' });
        return;
      }

      const spec = await generateDocSpecWithGemini(pattern, flags || '', description);
      res.json(spec);
    } catch (err: any) {
      console.error('Server error in /api/gemini/generate-doc:', err.message);
      res.status(err.statusCode || 500).json({
        error: 'DOC_GEN_ERROR',
        message: err.message || 'Failed to generate documentation specification with Gemini.',
      });
    }
  });

  // Vite development middleware or production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Regex Finesse server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
