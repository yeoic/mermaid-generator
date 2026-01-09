# Mermaid Live Editor

Browser-based real-time Mermaid.js diagram editor with Claude Code integration.

## Features

- **Real-time Rendering**: Instant diagram updates as you type
- **10 Diagram Types**: flowchart, sequence, class, state, ER, gantt, pie, mindmap, timeline, git
- **4 Themes**: default, dark, forest, neutral
- **Export**: SVG and PNG
- **Zoom Controls**: 25% - 200%
- **Auto-save**: Code saved to localStorage
- **Claude Code Skills**: `/mermaid-render`, `/mermaid-generate`

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Open browser
open http://localhost:3000
```

## Screenshot

The editor features a split-panel layout:
- **Left**: CodeMirror-based code editor with syntax highlighting
- **Right**: Live diagram preview

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save (auto-saved) |
| `Ctrl/Cmd + E` | Export SVG |
| `Esc` | Exit fullscreen |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/files` | GET | List .mmd files |
| `/api/load/:filename` | GET | Load .mmd file |
| `/api/save/:filename` | POST | Save .mmd file |
| `/api/render` | POST | Render Mermaid code to HTML |

## Claude Code Skills

### /mermaid-render

Render Mermaid diagrams in browser.

```bash
/mermaid-render                      # Open editor
/mermaid-render diagram.mmd          # Render file
/mermaid-render "flowchart TD; A-->B"  # Render code
```

### /mermaid-generate

Auto-generate diagrams from code or descriptions.

```bash
/mermaid-generate src/ --type class      # Class diagram from code
/mermaid-generate "Login flow" --type flowchart
```

## Supported Diagram Types

- **Flowchart**: Process flows, decision logic
- **Sequence**: API calls, service communication
- **Class**: OOP structure, inheritance
- **State**: State machines, lifecycle
- **ER Diagram**: Database schema
- **Gantt**: Project schedules
- **Pie Chart**: Data distribution
- **Mindmap**: Hierarchical ideas
- **Timeline**: Historical events
- **Git Graph**: Branch visualization

## License

MIT
