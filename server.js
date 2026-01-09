const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Parse JSON bodies
app.use(express.json());

// API: Load .mmd file
app.get('/api/load/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, filename);

    if (!filepath.endsWith('.mmd') && !filepath.endsWith('.mermaid')) {
        return res.status(400).json({ error: 'Only .mmd or .mermaid files are allowed' });
    }

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.json({ content: data });
    });
});

// API: Save .mmd file
app.post('/api/save/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, filename);
    const { content } = req.body;

    if (!filepath.endsWith('.mmd') && !filepath.endsWith('.mermaid')) {
        return res.status(400).json({ error: 'Only .mmd or .mermaid files are allowed' });
    }

    fs.writeFile(filepath, content, 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save file' });
        }
        res.json({ success: true });
    });
});

// API: List .mmd files
app.get('/api/files', (req, res) => {
    fs.readdir(__dirname, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read directory' });
        }
        const mmdFiles = files.filter(f => f.endsWith('.mmd') || f.endsWith('.mermaid'));
        res.json({ files: mmdFiles });
    });
});

// API: Render endpoint (for external tools)
app.post('/api/render', (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    // Return HTML page with the diagram
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Mermaid Diagram</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #fff;
        }
        .mermaid {
            max-width: 100%;
        }
    </style>
</head>
<body>
    <pre class="mermaid">
${code}
    </pre>
    <script>
        mermaid.initialize({ startOnLoad: true });
    </script>
</body>
</html>`;

    res.type('html').send(html);
});

// Fallback to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   Mermaid Live Editor is running!                     ║
║                                                       ║
║   Local:   http://localhost:${PORT}                      ║
║                                                       ║
║   Press Ctrl+C to stop the server                     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`);
});

module.exports = app;
