import DocumentChunk from '../models/DocumentChunk.js'

export async function addDocuments(collectionName, chunks, embeddings, urls) {
  const documents = chunks.map((chunk, i) => ({
    collectionName,
    text: chunk,
    embedding: embeddings[i],
    url: urls[i]
  }));

  await DocumentChunk.insertMany(documents);
  return documents.length;
}

export async function queryCollection(collectionName, queryEmbedding, nResults = 5) {
  const results = await DocumentChunk.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: Math.max(100, nResults * 10),
        limit: nResults,
        filter: { collectionName: collectionName }
      }
    },
    {
      $project: {
        text: 1,
        url: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]);

  // Format to match old ChromaDB response structure for backwards compatibility with chat.js
  return {
    documents: [ results.map(r => r.text) ],
    metadatas: [ results.map(r => ({ url: r.url })) ],
    distances: [ results.map(r => r.score) ]
  };
}

export async function deleteCollection(collectionName) {
  try {
    await DocumentChunk.deleteMany({ collectionName });
  } catch (e) {
    console.error('Error deleting collection chunks:', e);
  }
}