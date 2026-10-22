"use client";

import {
  ArrowDownToLine,
  ArrowUp,
  BookOpenText,
  Check,
  ChevronDown,
  FileText,
  Landmark,
  Plus,
  Scale,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

type Source = { id: string; title: string; sourceUrl: string; content: string };
type Citation = { citation: string; title: string; sourceUrl: string };
type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Citation[];
  toolsUsed?: string[];
};

const starterSource: Source = {
  id: "research-protocol",
  title: "Kiramira-Lex research and source-verification protocol",
  sourceUrl: "https://ulii.org/",
  content:
    "Research protocol for Ugandan legal research: verify the current text of legislation using an official or trusted primary source. Check commencement, amendments, subsidiary legislation, and applicable procedural rules before relying on a provision. For case law, confirm the court, decision date, subsequent treatment, and the exact holding in the judgment. For land matters, identify the asserted tenure and title documents without assuming that one document resolves competing claims. Distinguish pleaded facts from proven facts. Record the source title, URL, version or decision date, and the passage relied upon. This protocol is a research checklist only; it is not a statute, court rule, or legal opinion.",
};

const suggestions = [
  { label: "Review a charge sheet", prompt: "Help me screen this charge sheet for missing fields. Do not determine legal sufficiency: " },
  { label: "Check jurisdiction questions", prompt: "Create a jurisdiction verification checklist for these case facts: " },
  { label: "Research a legal issue", prompt: "Based only on the source material, summarize the legal issue and cite the relevant excerpts: " },
];

const toolLabels: Record<string, string> = {
  check_charge_sheet_completeness: "Charge sheet completeness check",
  jurisdiction_verification_checklist: "Jurisdiction verification checklist",
  calendar_date_calculator: "Calendar date calculation",
};

function newId() {
  return crypto.randomUUID();
}

export default function Home() {
  const [sources, setSources] = useState<Source[]>([starterSource]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [content, setContent] = useState("");
  const [notice, setNotice] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("kiramira-lex-sources");
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setSources(parsed as Source[]);
      } catch {
        window.localStorage.removeItem("kiramira-lex-sources");
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("kiramira-lex-sources", JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  async function sendMessage(event?: FormEvent, suggested?: string) {
    event?.preventDefault();
    const text = (suggested ?? input).trim();
    if (!text || pending) return;
    if (sources.length === 0) {
      setNotice("Add at least one authoritative source before starting research.");
      return;
    }
    if (sources.some((source) => source.content.length < 40)) {
      setNotice("Each source must contain at least 40 characters.");
      return;
    }
    setNotice("");
    setInput("");
    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setPending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sources }),
      });
      const data = (await response.json()) as {
        answer?: string;
        sources?: Citation[];
        toolsUsed?: string[];
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "Request failed.");
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data.answer || "No response was returned.",
          sources: data.sources,
          toolsUsed: data.toolsUsed,
        },
      ]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "An unexpected error occurred.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  function addSource(event: FormEvent) {
    event.preventDefault();
    if (title.trim().length === 0 || content.trim().length < 40) {
      setNotice("Add a source title and at least 40 characters of source text.");
      return;
    }
    if (sourceUrl.trim() && !/^https?:\/\/\S+$/i.test(sourceUrl.trim())) {
      setNotice("Source URLs must begin with http:// or https://.");
      return;
    }
    if (sources.length >= 8) {
      setNotice("You can add up to 8 source documents.");
      return;
    }
    if (sources.reduce((total, source) => total + source.content.length, 0) + content.length > 100000) {
      setNotice("Combined source material cannot exceed 100,000 characters.");
      return;
    }
    setSources((current) => [
      ...current,
      { id: newId(), title: title.trim(), sourceUrl: sourceUrl.trim(), content: content.trim() },
    ]);
    setTitle("");
    setSourceUrl("");
    setContent("");
    setFormOpen(false);
    setNotice("");
  }

  function exportConversation() {
    const transcript = messages
      .map((message) => `${message.role.toUpperCase()}\n${message.content}`)
      .join("\n\n");
    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "kiramira-lex-research.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-icon"><Scale size={22} strokeWidth={1.8} /></span>
          <span><strong>Kiramira-Lex</strong><small>LEGAL RESEARCH AI</small></span>
        </a>
        <div className="sidebar-rule" />
        <div className="workspace-label">WORKSPACE</div>
        <button className="nav-item active"><Sparkles size={17} /> Legal research <span className="nav-dot" /></button>
        <button className="nav-item" onClick={() => setPanelOpen(true)}><BookOpenText size={17} /> Knowledge base <span className="nav-count">{sources.length}</span></button>
        <div className="sidebar-spacer" />
        <div className="jurisdiction-card">
          <div className="jurisdiction-icon"><Landmark size={17} /></div>
          <div><strong>Uganda focused</strong><p>Built for local legal practice</p></div>
        </div>
        <div className="sidebar-footer"><ShieldCheck size={15} /> Your sources stay in this browser</div>
      </aside>

      <section className="main-column">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Legal research</strong></div>
          <div className="topbar-actions">
            <button className="text-button" onClick={exportConversation} disabled={!messages.length}><ArrowDownToLine size={16} /> Export</button>
            <button className="knowledge-button" onClick={() => setPanelOpen(true)}><BookOpenText size={16} /> Sources <span>{sources.length}</span><ChevronDown size={14} /></button>
          </div>
        </header>

        <div className="chat-layout">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-mark"><Scale size={27} /></div>
              <div className="eyebrow"><span /> UGANDA LEGAL RESEARCH</div>
              <h1>Good research starts<br />with the <em>right sources.</em></h1>
              <p className="welcome-subtitle">Ask a question, screen an early filing, or organize your research. Answers are grounded in the source material you add.</p>
              <div className="suggestion-grid">
                {suggestions.map((suggestion, index) => (
                  <button key={suggestion.label} className="suggestion-card" onClick={() => setInput(suggestion.prompt)}>
                    <span className={`suggestion-icon icon-${index}`}><FileText size={17} /></span>
                    <span><strong>{suggestion.label}</strong><small>{index === 0 ? "Spot incomplete filing details" : index === 1 ? "Organize the facts to verify" : "Synthesize with source citations"}</small></span>
                    <span className="suggestion-arrow">↗</span>
                  </button>
                ))}
              </div>
              <div className="welcome-source-note"><ShieldCheck size={15} /> Start with the included research protocol, then add verified legal texts and judgments.</div>
            </div>
          ) : (
            <div className="conversation">
              {messages.map((message, index) => (
                <article className={`message-row ${message.role}`} key={`${message.role}-${index}`}>
                  <div className="avatar">{message.role === "assistant" ? <Scale size={17} /> : "Y"}</div>
                  <div className="message-body">
                    <div className="message-author">{message.role === "assistant" ? "Kiramira-Lex" : "You"} <span>{message.role === "assistant" ? "Research assistant" : "You"}</span></div>
                    <div className="message-content">{message.content}</div>
                    {!!message.toolsUsed?.length && <div className="tool-results">{message.toolsUsed.map((name) => <span key={name}><Check size={13} /> {toolLabels[name] || name}</span>)}</div>}
                    {!!message.sources?.length && <div className="citations"><div className="citation-heading">SOURCES USED</div>{message.sources.map((citation) => <a key={citation.citation} href={citation.sourceUrl || undefined} target="_blank" rel="noreferrer"><span>{citation.citation}</span>{citation.title}</a>)}</div>}
                  </div>
                </article>
              ))}
              {pending && <div className="thinking"><span /><span /><span /> Searching sources and preparing your response…</div>}
              <div ref={bottomRef} />
            </div>
          )}

          {notice && <div className="notice" role="alert">{notice}<button onClick={() => setNotice("")}><X size={14} /></button></div>}

          <div className="composer-wrap">
            <div className="composer-hint"><span className="live-dot" /> GROUNDED IN YOUR SOURCES <button onClick={() => setPanelOpen(true)}>{sources.length} documents <ChevronDown size={12} /></button></div>
            <form className="composer" onSubmit={(event) => sendMessage(event)}>
              <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about Ugandan law, a case file, or a procedural question…" rows={2} maxLength={4000} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} />
              <div className="composer-bottom"><span>AI can make mistakes. Verify legal conclusions in primary sources.</span><button type="submit" aria-label="Send message" disabled={pending || input.trim().length < 3}><ArrowUp size={18} /></button></div>
            </form>
            <div className="footer-note"><ShieldCheck size={13} /> Research support, not legal advice <span>·</span> Do not submit confidential or personally identifying information</div>
          </div>
        </div>
      </section>

      {panelOpen && (
        <>
          <button aria-label="Close sources panel" className="panel-backdrop" onClick={() => setPanelOpen(false)} />
          <aside className="sources-panel">
            <div className="panel-header"><div><div className="panel-kicker">RESEARCH MATERIAL</div><h2>Knowledge base</h2></div><button className="icon-button" onClick={() => setPanelOpen(false)} aria-label="Close"><X size={18} /></button></div>
            <p className="panel-description">Add authoritative legal text or judgments. Documents are stored only in this browser and sent to OpenAI for retrieval when you ask a question.</p>
            <button className="add-source-button" onClick={() => setFormOpen(true)}><Plus size={16} /> Add a source</button>
            {formOpen && <form className="source-form" onSubmit={addSource}>
              <label>Source title<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} placeholder="e.g. Land Act, Cap. 227" required /></label>
              <label>Official URL <span>optional</span><input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} maxLength={1000} placeholder="https://ulii.org/..." /></label>
              <label>Source text<textarea value={content} onChange={(event) => setContent(event.target.value)} minLength={40} maxLength={30000} rows={7} placeholder="Paste verified text or relevant excerpts…" required /></label>
              <div className="form-count">{content.length.toLocaleString()} / 30,000 characters</div>
              <div className="form-actions"><button type="button" className="cancel-button" onClick={() => setFormOpen(false)}>Cancel</button><button className="save-button" type="submit"><Check size={14} /> Save source</button></div>
            </form>}
            <div className="source-list">
              <div className="source-list-heading">YOUR SOURCES <span>{sources.length} / 8</span></div>
              {sources.map((source) => <div className="source-entry" key={source.id}><div className="source-entry-icon"><FileText size={16} /></div><div className="source-entry-copy"><strong>{source.title}</strong><small>{source.content.length.toLocaleString()} characters{source.sourceUrl ? " · Linked source" : " · Pasted text"}</small></div>{source.id !== starterSource.id && <button className="delete-source" onClick={() => setSources((current) => current.filter((item) => item.id !== source.id))} aria-label={`Remove ${source.title}`}><Trash2 size={15} /></button>}</div>)}
            </div>
            <div className="panel-tip"><ShieldCheck size={16} /><span><strong>Source first.</strong> Check that uploaded legislation and judgments are current before relying on them.</span></div>
            <button className="done-button" onClick={() => setPanelOpen(false)}>Done</button>
          </aside>
        </>
      )}
    </main>
  );
}
