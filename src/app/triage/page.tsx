"use client";

import Link from "next/link";
import { ArrowLeft, Check, CircleAlert, FileSearch, RotateCcw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { screenChargeSheet } from "@/lib/charge-sheet-screen";

const maxCharacters = 30000;

export default function TriagePage() {
  const [text, setText] = useState("");
  const results = useMemo(() => screenChargeSheet(text), [text]);
  const checkedCount = results.filter((result) => result.found).length;
  const hasScanned = text.trim().length > 0;

  return (
    <main className="triage-page">
      <header className="triage-topbar">
        <Link className="triage-brand" href="/">
          <span className="triage-brand-mark">K</span>
          <span><strong>Kiramira-Lex</strong><small>UGANDA LEGAL RESEARCH</small></span>
        </Link>
        <Link className="triage-back" href="/"><ArrowLeft size={15} /> Back to research</Link>
      </header>

      <section className="triage-content">
        <div className="triage-eyebrow"><FileSearch size={14} /> EARLY-FILING WORKSPACE</div>
        <h1>Charge-sheet <em>screening</em></h1>
        <p className="triage-intro">
          Check whether common identifying labels and references appear in a draft. Review the original
          document and current primary sources before taking any action.
        </p>

        <div className="triage-privacy"><ShieldCheck size={16} /><span><strong>Local-only screening.</strong> Text is processed in this browser and is not sent to the research assistant.</span></div>

        <label className="triage-input-label" htmlFor="charge-sheet-text">Paste a redacted draft or relevant excerpt</label>
        <textarea
          id="charge-sheet-text"
          className="triage-textarea"
          value={text}
          onChange={(event) => setText(event.target.value.slice(0, maxCharacters))}
          maxLength={maxCharacters}
          placeholder={"Paste text here, for example:\nAccused: [REDACTED]\nOffence: [description]\nParticulars: [summary]\nSection 123"}
          rows={10}
        />
        <div className="triage-input-footer"><span>Remove names and other identifying details before pasting.</span><span>{text.length.toLocaleString()} / {maxCharacters.toLocaleString()}</span></div>

        {hasScanned ? (
          <section className="triage-results" aria-live="polite">
            <div className="triage-results-heading">
              <div><div className="triage-results-kicker">TEXT INDICATOR CHECK</div><h2>{checkedCount} of {results.length} indicators found</h2></div>
              <button className="triage-reset" onClick={() => setText("")}><RotateCcw size={14} /> Clear</button>
            </div>
            <ul className="triage-checklist">
              {results.map((result) => (
                <li key={result.id} className={result.found ? "found" : "not-found"}>
                  <span className="triage-check-icon">{result.found ? <Check size={15} /> : <CircleAlert size={15} />}</span>
                  <span><strong>{result.label}</strong><small>{result.found ? "A matching text pattern was found." : "No matching text pattern was found."} {result.description}.</small></span>
                  <span className="triage-status">{result.found ? "Found" : "Review"}</span>
                </li>
              ))}
            </ul>
            <p className="triage-disclaimer">
              This is a limited keyword scan, not a legal review. A match does not establish that information is
              accurate, complete, or legally sufficient; no match does not prove that it is absent from the
              original document. This tool does not assess bail, jurisdiction, statutory elements, or filing
              compliance.
            </p>
          </section>
        ) : (
          <div className="triage-empty"><FileSearch size={18} /><span>Results will appear here as you enter text.</span></div>
        )}

        <div className="triage-footer"><ShieldCheck size={14} /> Research support, not legal advice <span>·</span> Do not paste confidential or identifying information</div>
      </section>
    </main>
  );
}
