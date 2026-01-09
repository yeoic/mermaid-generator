// Mermaid Live Editor - Main Application

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        DEBOUNCE_DELAY: 300,
        LOCAL_STORAGE_KEY: 'mermaid-editor-code',
        LOCAL_STORAGE_THEME_KEY: 'mermaid-editor-theme',
        MIN_ZOOM: 25,
        MAX_ZOOM: 200,
        ZOOM_STEP: 25
    };

    // Diagram Templates
    const TEMPLATES = {
        flowchart: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`,

        sequence: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!`,

        class: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }
    class Zebra{
        +bool is_wild
        +run()
    }`,

        state: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`,

        er: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
    CUSTOMER {
        string name
        string custNumber
        string sector
    }
    ORDER {
        int orderNumber
        string deliveryAddress
    }
    LINE-ITEM {
        string productCode
        int quantity
        float pricePerUnit
    }`,

        gantt: `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2024-01-01, 30d
    Another task     :after a1, 20d
    section Another
    Task in sec      :2024-01-12, 12d
    another task     :24d`,

        pie: `pie showData
    title Key Elements in Product
    "Calcium" : 42.96
    "Potassium" : 50.05
    "Magnesium" : 10.01
    "Iron" :  5`,

        mindmap: `mindmap
  root((mindmap))
    Origins
      Long history
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid`,

        timeline: `timeline
    title History of Social Media Platform
    2002 : LinkedIn
    2004 : Facebook
         : Google
    2005 : Youtube
    2006 : Twitter`,

        git: `gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
    commit`
    };

    // State
    let state = {
        zoom: 100,
        isFullscreen: false,
        isDragging: false,
        editor: null
    };

    // DOM Elements
    const elements = {};

    // Initialize
    function init() {
        cacheElements();
        initMermaid();
        initEditor();
        loadSavedCode();
        bindEvents();
        renderDiagram();
    }

    // Cache DOM Elements
    function cacheElements() {
        elements.codeEditor = document.getElementById('code-editor');
        elements.preview = document.getElementById('mermaid-preview');
        elements.previewContainer = document.getElementById('preview-container');
        elements.errorDisplay = document.getElementById('error-display');
        elements.diagramType = document.getElementById('diagram-type');
        elements.themeSelect = document.getElementById('theme-select');
        elements.btnSvg = document.getElementById('btn-svg');
        elements.btnPng = document.getElementById('btn-png');
        elements.btnFullscreen = document.getElementById('btn-fullscreen');
        elements.btnCopy = document.getElementById('btn-copy');
        elements.btnZoomIn = document.getElementById('btn-zoom-in');
        elements.btnZoomOut = document.getElementById('btn-zoom-out');
        elements.btnZoomReset = document.getElementById('btn-zoom-reset');
        elements.zoomLevel = document.getElementById('zoom-level');
        elements.resizer = document.getElementById('resizer');
        elements.editorPanel = document.querySelector('.editor-panel');
        elements.statusMessage = document.getElementById('status-message');
        elements.container = document.querySelector('.container');
    }

    // Initialize Mermaid
    function initMermaid() {
        const savedTheme = localStorage.getItem(CONFIG.LOCAL_STORAGE_THEME_KEY) || 'default';
        elements.themeSelect.value = savedTheme;

        mermaid.initialize({
            startOnLoad: false,
            theme: savedTheme,
            securityLevel: 'loose',
            flowchart: { useMaxWidth: true },
            sequence: { useMaxWidth: true }
        });
    }

    // Initialize CodeMirror Editor
    function initEditor() {
        if (typeof CodeMirror !== 'undefined') {
            state.editor = CodeMirror.fromTextArea(elements.codeEditor, {
                lineNumbers: true,
                theme: 'dracula',
                mode: 'text',
                lineWrapping: true,
                tabSize: 4,
                indentWithTabs: false
            });

            state.editor.on('change', debounce(handleCodeChange, CONFIG.DEBOUNCE_DELAY));
        } else {
            // Fallback to textarea
            elements.codeEditor.addEventListener('input',
                debounce(handleCodeChange, CONFIG.DEBOUNCE_DELAY));
        }
    }

    // Load Saved Code
    function loadSavedCode() {
        const savedCode = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
        const code = savedCode || TEMPLATES.flowchart;

        if (state.editor) {
            state.editor.setValue(code);
        } else {
            elements.codeEditor.value = code;
        }
    }

    // Bind Events
    function bindEvents() {
        // Diagram type change
        elements.diagramType.addEventListener('change', handleDiagramTypeChange);

        // Theme change
        elements.themeSelect.addEventListener('change', handleThemeChange);

        // Export buttons
        elements.btnSvg.addEventListener('click', exportSVG);
        elements.btnPng.addEventListener('click', exportPNG);

        // Fullscreen
        elements.btnFullscreen.addEventListener('click', toggleFullscreen);

        // Copy
        elements.btnCopy.addEventListener('click', copyCode);

        // Zoom controls
        elements.btnZoomIn.addEventListener('click', () => adjustZoom(CONFIG.ZOOM_STEP));
        elements.btnZoomOut.addEventListener('click', () => adjustZoom(-CONFIG.ZOOM_STEP));
        elements.btnZoomReset.addEventListener('click', resetZoom);

        // Resizer
        elements.resizer.addEventListener('mousedown', startResize);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);

        // Escape fullscreen
        document.addEventListener('fullscreenchange', handleFullscreenChange);
    }

    // Handle Code Change
    function handleCodeChange() {
        const code = getCode();
        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, code);
        renderDiagram();
    }

    // Handle Diagram Type Change
    function handleDiagramTypeChange(e) {
        const type = e.target.value;
        const template = TEMPLATES[type];

        if (template) {
            if (state.editor) {
                state.editor.setValue(template);
            } else {
                elements.codeEditor.value = template;
            }
            renderDiagram();
        }
    }

    // Handle Theme Change
    function handleThemeChange(e) {
        const theme = e.target.value;
        localStorage.setItem(CONFIG.LOCAL_STORAGE_THEME_KEY, theme);

        mermaid.initialize({
            startOnLoad: false,
            theme: theme,
            securityLevel: 'loose'
        });

        renderDiagram();
    }

    // Render Diagram
    async function renderDiagram() {
        const code = getCode().trim();

        if (!code) {
            elements.preview.innerHTML = '<p style="color: #666;">Enter Mermaid code to see the diagram</p>';
            hideError();
            return;
        }

        try {
            // Clear previous content
            elements.preview.innerHTML = '';

            // Generate unique ID
            const id = 'mermaid-' + Date.now();

            // Render diagram
            const { svg } = await mermaid.render(id, code);
            elements.preview.innerHTML = svg;

            // Apply zoom
            updateZoom();

            hideError();
            updateStatus('Rendered successfully');
        } catch (error) {
            showError(error.message || 'Invalid Mermaid syntax');
            updateStatus('Syntax error');
        }
    }

    // Get Code
    function getCode() {
        return state.editor ? state.editor.getValue() : elements.codeEditor.value;
    }

    // Set Code
    function setCode(code) {
        if (state.editor) {
            state.editor.setValue(code);
        } else {
            elements.codeEditor.value = code;
        }
    }

    // Export SVG
    function exportSVG() {
        const svg = elements.preview.querySelector('svg');
        if (!svg) {
            alert('No diagram to export');
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        downloadBlob(blob, 'mermaid-diagram.svg');
        updateStatus('SVG exported');
    }

    // Export PNG
    async function exportPNG() {
        const svg = elements.preview.querySelector('svg');
        if (!svg) {
            alert('No diagram to export');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();

        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = function() {
            canvas.width = img.width * 2;
            canvas.height = img.height * 2;
            ctx.scale(2, 2);
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            canvas.toBlob(function(blob) {
                downloadBlob(blob, 'mermaid-diagram.png');
                updateStatus('PNG exported');
            }, 'image/png');
        };

        img.src = url;
    }

    // Download Blob
    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Toggle Fullscreen
    function toggleFullscreen() {
        state.isFullscreen = !state.isFullscreen;
        elements.container.classList.toggle('fullscreen', state.isFullscreen);

        if (state.isFullscreen) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }

    // Handle Fullscreen Change
    function handleFullscreenChange() {
        if (!document.fullscreenElement) {
            state.isFullscreen = false;
            elements.container.classList.remove('fullscreen');
        }
    }

    // Copy Code
    function copyCode() {
        const code = getCode();
        navigator.clipboard.writeText(code).then(() => {
            updateStatus('Code copied to clipboard');
        }).catch(() => {
            updateStatus('Failed to copy');
        });
    }

    // Zoom Controls
    function adjustZoom(delta) {
        state.zoom = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, state.zoom + delta));
        updateZoom();
    }

    function resetZoom() {
        state.zoom = 100;
        updateZoom();
    }

    function updateZoom() {
        elements.zoomLevel.textContent = state.zoom + '%';
        elements.preview.style.transform = `scale(${state.zoom / 100})`;
    }

    // Resizer
    function startResize(e) {
        state.isDragging = true;
        elements.resizer.classList.add('dragging');
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
    }

    function handleResize(e) {
        if (!state.isDragging) return;

        const containerRect = elements.container.getBoundingClientRect();
        const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        if (percentage > 20 && percentage < 80) {
            elements.editorPanel.style.flex = `0 0 ${percentage}%`;
        }
    }

    function stopResize() {
        state.isDragging = false;
        elements.resizer.classList.remove('dragging');
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
    }

    // Keyboard Shortcuts
    function handleKeyboard(e) {
        // Ctrl/Cmd + S: Save (prevent default)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            updateStatus('Auto-saved');
        }

        // Escape: Exit fullscreen
        if (e.key === 'Escape' && state.isFullscreen) {
            toggleFullscreen();
        }

        // Ctrl/Cmd + E: Export SVG
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportSVG();
        }
    }

    // Error Display
    function showError(message) {
        elements.errorDisplay.textContent = message;
        elements.errorDisplay.classList.remove('hidden');
    }

    function hideError() {
        elements.errorDisplay.classList.add('hidden');
    }

    // Status Updates
    function updateStatus(message) {
        elements.statusMessage.textContent = message;
    }

    // Utility: Debounce
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API for external use
    window.MermaidEditor = {
        setCode: setCode,
        getCode: getCode,
        render: renderDiagram,
        exportSVG: exportSVG,
        exportPNG: exportPNG
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
