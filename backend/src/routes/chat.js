import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { generateEmbedding } from '../services/embeddings.js'
import { queryCollection } from '../services/vectordb.js'
import protect from '../middleware/authMiddleware.js'
import ChatSession from '../models/ChatSession.js'

const router = express.Router()

router.post('/', protect, async(req, res) => {
    const { question, collection, history = [], sessionId } = req.body
    
    if(!question || !collection){
        return res.status(400).json({
            error: 'Question and collection are required'
        })
    }

    // Check tokens if user is real (not dev fallback)
    if (req.user && req.user._id !== 'dev_user') {
        if (req.user.tokens <= 0) {
            return res.status(403).json({
                error: 'Tokens exhausted',
                code: 'TOKEN_EXHAUSTED'
            })
        }
    }

    try{
        const questionEmbedding = await generateEmbedding(question)

        const results = await queryCollection(collection, questionEmbedding, 5)

        const chunks = results.documents[0] || []
        const sources = (results.metadatas[0] || []).map(m => m.url)
        const distances = results.distances[0] || []



        if(chunks.length === 0){
            return res.status(404).json({
                error: 'No relevant documents found'
            })
        }

        const context = chunks.map((chunk, i) => 
            `Source: ${sources[i]} (relevance distance: ${distances[i]?.toFixed(4) || 'N/A'})\nContent: ${chunk}`
        ).join('\n\n')

        const prompt = `Context from the source material:
        ${context}

        Question: ${question}

        Answer the question based only on the context provided above. If the answer is not in the context, say "I couldn't find that information in the source material."`

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const systemInstruction = `You are a helpful assistant that answers questions based on provided source context.
Answer the question based only on the context provided by the user in the latest turn. If the answer is not in the context, say "I couldn't find that information in the source material." Keep responses factual and aligned strictly with the provided context.`
        
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            systemInstruction
        })

        // format history for gemini startChat
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }))

        const chat = model.startChat({
            history: formattedHistory
        })

        const result = await chat.sendMessage(prompt)
        const answer = result.response.text()

        const uniqueSources = [...new Set(sources)]

        // Save to Database
        if (sessionId && req.user && req.user._id !== 'dev_user') {
            await ChatSession.updateOne(
                { _id: sessionId, userId: req.user._id },
                {
                    $push: {
                        messages: {
                            $each: [
                                { role: 'user', text: question, sources: [] },
                                { role: 'assistant', text: answer, sources: uniqueSources }
                            ]
                        }
                    }
                }
            );
        }

        // Decrement token
        let tokensRemaining = 'N/A'
        if (req.user && req.user._id !== 'dev_user') {
            req.user.tokens -= 1
            await req.user.save()
            tokensRemaining = req.user.tokens
        }

        res.json({
            answer,
            sources: uniqueSources,
            tokensRemaining
        })
    }
    catch(error){
        console.error('Chat error stack:', error)
        res.status(500).json({
            error: error.message
        })
    }
})

export default router