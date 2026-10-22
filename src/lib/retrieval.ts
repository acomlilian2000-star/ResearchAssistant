import "server-only";
import { MemoryVectorStore } from "@langchain/community/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export type LegalSource = {
  id: string;
  title: string;
  sourceUrl: string;
  content: string;
};

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 900,
  chunkOverlap: 140,
});

export async function retrieveLegalContext(
  query: string,
  sources: LegalSource[],
) {
  const sourceDocs = sources.map(
    (source) =>
      new Document({
        pageContent: source.content,
        metadata: {
          sourceId: source.id,
          title: source.title,
          sourceUrl: source.sourceUrl,
        },
      }),
  );
  const chunks = await splitter.splitDocuments(sourceDocs);
  const embeddings = new OpenAIEmbeddings({
    model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  });
  const store = await MemoryVectorStore.fromDocuments(chunks, embeddings);
  const matches = await store.similaritySearch(query, 5);

  return matches.map((document, index) => ({
    citation: `S${index + 1}`,
    title: String(document.metadata.title),
    sourceUrl: String(document.metadata.sourceUrl),
    excerpt: document.pageContent,
  }));
}
