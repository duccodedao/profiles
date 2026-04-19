import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // GitHub Proxy Endpoint
  app.post('/api/github/upload', async (req, res) => {
    try {
      const { config, fileData, fileName } = req.body;
      
      if (!config || !fileData || !fileName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { username, repo, branch, folder, accessToken } = config;
      const path = folder ? `${folder}/${fileName}` : fileName;
      
      const response = await axios.put(
        `https://api.github.com/repos/${username}/${repo}/contents/${path}`,
        {
          message: `Upload image: ${fileName}`,
          content: fileData.split(',')[1], // Remove "data:image/png;base64,"
          branch: branch || 'main'
        },
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      res.json({
        url: response.data.content.download_url,
        sha: response.data.content.sha
      });
    } catch (error: any) {
      console.error('GitHub Upload Error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ 
        error: 'Failed to upload to GitHub',
        details: error.response?.data || error.message 
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
