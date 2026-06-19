import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })

const result = await model.embedContent('hello world')
console.log('Success! Embedding length:', result.embedding.values.length)