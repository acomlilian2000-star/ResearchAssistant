# Kiramira-Lex AI

A Next.js legal research and early case-triage prototype for Ugandan legal practice. It uses LangChain with the OpenAI API for embeddings, retrieval-augmented responses, and tool calling.

## Setup

1. Install Node.js 20 or later.
2. Run `npm install`.
3. Add an OpenAI API key to `.env.local` as `OPENAI_API_KEY`. The file is ignored by Git; do not commit real keys.
4. Run `npm run dev` and open the local URL shown in the terminal.

Set `OPENAI_MODEL` and `OPENAI_EMBEDDING_MODEL` in `.env.local` to use different OpenAI models.

## Using the assistant

The included research protocol is a checklist, not a body of Ugandan law. Add verified legislation, court rules, or judgments in the Sources panel before asking legal questions. Source text is stored in this browser's local storage and sent to the server for retrieval when you submit a question. The server embeds the supplied source text, splits it into overlapping chunks, retrieves the most relevant excerpts, then asks the model to answer with source labels.

Three tools are available to the model:

- Charge-sheet administrative completeness screening
- Jurisdiction verification checklist (does not decide jurisdiction)
- Calendar-date arithmetic (does not establish legal deadlines or counting conventions)

## Safety and limitations

This prototype provides research support, not legal advice. It does not independently verify uploaded documents, current law, bail eligibility, jurisdiction, or legal sufficiency. Do not upload confidential, privileged, or personally identifying information. Verify any legal proposition against current primary sources and consult a qualified Ugandan legal professional.

The vector store is rebuilt for each request and is not persisted on the server. Sources remain in browser storage unless removed or browser data is cleared.
