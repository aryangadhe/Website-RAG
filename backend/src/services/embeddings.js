import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()
const API_KEY = process.env.GEMINI_API_KEY

const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001'})


export async function generateEmbedding(text){
    const result = await model.embedContent(text)
    return result.embedding.values
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateEmbeddings(texts){
    const batchSize = 25; 
    const batches = []
    
    const limitedTexts = texts.slice(0, 150);
    
    for (let i = 0; i < limitedTexts.length; i += batchSize) {
        batches.push(limitedTexts.slice(i, i + batchSize))
    }

    const allResults = [];

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        let success = false;
        let attempts = 0;
        
        while (!success && attempts < 3) {
            try {
                const result = await model.batchEmbedContents({
                    requests: batch.map(text => ({
                        model: 'models/gemini-embedding-001',
                        content: { parts: [{ text }] }
                    }))
                });
                
                const embeddings = result.embeddings.map(e => e.values);
                allResults.push(...embeddings);
                success = true;

                if (i < batches.length - 1) {
                    console.log(`Embedded batch ${i + 1}/${batches.length}, sleeping for 3s...`);
                    await sleep(3000);
                }
            } catch (error) {
                if (error.message.includes('429')) {
                    attempts++;
                    const waitTime = 15000 * attempts; // Wait 15s, then 30s
                    console.warn(`[429 Rate Limit] Retrying batch ${i + 1} in ${waitTime/1000}s...`);
                    await sleep(waitTime);
                } else {
                    console.error(`Error embedding batch ${i + 1}:`, error.message);
                    throw error;
                }
            }
        }
        
        if (!success) {
            console.warn(`Skipping remaining batches due to persistent rate limit errors.`);
            break; 
        }
    }

    return allResults;
}