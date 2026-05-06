import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import ReactMarkdown from 'react-markdown';
import './App.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const MODES = [
  { id: 'bullet', label: '📋 Bullet Points' },
  { id: 'short', label: '⚡ Short' },
  { id: 'detailed', label: '📖 Detailed' },
  { id: 'keyfacts', label: '🎯 Key Facts' },
];

const MODE_PROMPTS = {
  bullet: 'Summarize using clear bullet points covering main topic, key points, and conclusions.',
  short: 'Give a very short 3-5 sentence summary of the main points only.',
  detailed: 'Give a detailed comprehensive summary covering all important topics and conclusions in depth.',
  keyfacts: 'Extract only the most important facts, numbers, dates, and key takeaways as a numbered list.',
};

function App() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('dark');
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [language, setLanguage] = useState('');
  const [summaryMode, setSummaryMode] = useState('bullet');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('summaryHistory') || '[]'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Extract text from PDF ──────────────────────────────
  const extractTextFromPDF = async (f) => {
    const arrayBuffer = await f.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    setPageCount(pdf.numPages);
    let fullText = '';
    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(item => item.str).join(' ') + '\n';
    }
    const words = fullText.trim().split(/\s+/).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200));
    return fullText;
  };

  // ── Handle file input ──────────────────────────────────
  const handleFile = (f) => {
    if (f?.type === 'application/pdf') {
      setFile(f); setFileName(f.name); setSummary('');
      setError(''); setWordCount(0); setReadingTime(0); setLanguage('');
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  // ── Summarize ──────────────────────────────────────────
  const summarizePDF = async () => {
    if (!file) return;
    setLoading(true); setError(''); setSummary('');
    try {
      const pdfText = await extractTextFromPDF(file);
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1024,
          messages: [
            {
              role: 'system',
              content: `You are a PDF summarizer. ${MODE_PROMPTS[summaryMode]} Also detect the document language and start with "Language: [language]" on the first line.`
            },
            { role: 'user', content: `Text: ${pdfText.slice(0, 15000)}` }
          ]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const content = data.choices[0].message.content;
      const langMatch = content.match(/^Language:\s*(.+)/m);
      if (langMatch) setLanguage(langMatch[1].trim());
      const cleanSummary = content.replace(/^Language:.*\n?/m, '').trim();
      setSummary(cleanSummary);

      // Save to history
      const entry = { id: Date.now(), fileName, summary: cleanSummary, mode: summaryMode, date: new Date().toLocaleDateString() };
      const updated = [entry, ...history].slice(0, 5);
      setHistory(updated);
      localStorage.setItem('summaryHistory', JSON.stringify(updated));
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    }
    setLoading(false);
  };

  // ── Download as TXT ────────────────────────────────────
  const downloadTXT = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${fileName}-summary.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Download as PDF ────────────────────────────────────
  const downloadPDF = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>${fileName} - Summary</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #1a1a1a; line-height: 1.8; }
        h1 { font-size: 22px; color: #6366f1; margin-bottom: 6px; }
        .meta { font-size: 12px; color: #666; margin-bottom: 24px; padding-bottom: 14px; border-bottom: 2px solid #e2e8f0; }
        h2, h3 { margin: 16px 0 6px; }
        ul, ol { padding-left: 20px; } li { margin-bottom: 6px; }
        strong { color: #6366f1; } p { margin-bottom: 10px; }
      </style></head><body>
      <h1>📄 ${fileName}</h1>
      <div class="meta">Mode: ${summaryMode} &nbsp;·&nbsp; ${new Date().toLocaleDateString()} ${language ? `&nbsp;·&nbsp; ${language}` : ''}</div>
      ${summary
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^### (.*)/gm, '<h3>$1</h3>')
        .replace(/^## (.*)/gm, '<h2>$1</h2>')
        .replace(/^# (.*)/gm, '<h1>$1</h1>')
        .replace(/^[-*] (.*)/gm, '<li>$1</li>')
        .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
        .replace(/\n/g, '<br>')}
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  // ── Reset ──────────────────────────────────────────────
  const reset = () => {
    setFile(null); setSummary(''); setError('');
    setFileName(''); setPageCount(0); setWordCount(0);
    setReadingTime(0); setLanguage('');
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <div className={`app ${theme}`}>

      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <span className="logo">📄 PDF Summarizer</span>
          <span className="powered">Powered by Groq AI</span>
        </div>
        <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <div className="layout">

        {/* SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>🕒 Recent Summaries</h3>
            <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>
          {history.length === 0 ? (
            <p className="no-history">No summaries yet</p>
          ) : (
            <div className="history-list">
              {history.map(entry => (
                <div key={entry.id} className="history-item"
                  onClick={() => { setSummary(entry.summary); setFileName(entry.fileName); setSidebarOpen(false); }}>
                  <p className="history-name">{entry.fileName}</p>
                  <p className="history-meta">{entry.date} · {entry.mode}</p>
                </div>
              ))}
            </div>
          )}
          {history.length > 0 && (
            <button className="clear-history" onClick={() => { setHistory([]); localStorage.removeItem('summaryHistory'); }}>
              🗑️ Clear History
            </button>
          )}
        </aside>

        {/* OVERLAY */}
        {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

        {/* MAIN */}
        <main className="main">

          {/* HERO */}
          <div className="hero">
            <h1>Summarize Any PDF Instantly</h1>
            <p>Upload your PDF and get an AI-powered summary in seconds</p>
          </div>

          {/* MODE SELECTOR */}
          <div className="mode-selector">
            <p className="mode-label">Summary Mode:</p>
            <div className="mode-buttons">
              {MODES.map(mode => (
                <button key={mode.id}
                  className={`mode-btn ${summaryMode === mode.id ? 'active' : ''}`}
                  onClick={() => setSummaryMode(mode.id)}>
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* UPLOAD */}
          <div
            className={`upload-area ${file ? 'has-file' : ''}`}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
            onDragOver={e => e.preventDefault()}
            onClick={() => !file && document.getElementById('fileInput').click()}
          >
            <input id="fileInput" type="file" accept=".pdf"
              onChange={e => handleFile(e.target.files[0])} hidden />
            {file ? (
              <div className="file-info">
                <span className="file-icon">📄</span>
                <div className="file-details">
                  <p className="file-name">{fileName}</p>
                  <p className="file-pages">{pageCount} pages detected</p>
                </div>
                <button className="remove-file" onClick={e => { e.stopPropagation(); reset(); }}>✕</button>
              </div>
            ) : (
              <div className="upload-prompt">
                <span className="upload-icon">⬆️</span>
                <p className="upload-text">Drag and drop your PDF here</p>
                <p className="upload-subtext">or click to browse</p>
                <span className="upload-hint">Supports PDF files up to 10MB</span>
              </div>
            )}
          </div>

          {/* STATS */}
          {wordCount > 0 && (
            <div className="stats-bar">
              <div className="stat">📄 <span>{pageCount} Pages</span></div>
              <div className="stat">📝 <span>{wordCount.toLocaleString()} Words</span></div>
              <div className="stat">⏱️ <span>{readingTime} min read</span></div>
              {language && <div className="stat">🌐 <span>{language}</span></div>}
            </div>
          )}

          {/* ERROR */}
          {error && <div className="error">⚠️ {error}</div>}

          {/* SUMMARIZE BUTTON */}
          {file && !summary && (
            <button className="summarize-btn" onClick={summarizePDF} disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span></span><span></span><span></span> Analyzing PDF...
                </span>
              ) : `✨ Summarize — ${MODES.find(m => m.id === summaryMode)?.label}`}
            </button>
          )}

          {/* SUMMARY */}
          {summary && (
            <div className="summary-section">
              <div className="summary-header">
                <h2>📋 Summary</h2>
                <div className="summary-actions">
                  <button className="copy-btn" onClick={() => {
                    navigator.clipboard.writeText(summary);
                    setCopied(true); setTimeout(() => setCopied(false), 2000);
                  }}>
                    {copied ? '✅ Copied!' : '📋 Copy'}
                  </button>
                  <button className="download-btn" onClick={downloadTXT}>📥 TXT</button>
                  <button className="download-btn" onClick={downloadPDF}>📄 PDF</button>
                </div>
              </div>
              <div className="summary-content">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
              <button className="reset-btn" onClick={reset}>📄 Summarize Another PDF</button>
            </div>
          )}

        </main>
      </div>

      <footer className="footer">
        <p>Built with React + Groq AI by <a href="https://github.com/yourusername" target="_blank">AbrarFahim</a></p>
      </footer>
    </div>
  );
}

export default App;