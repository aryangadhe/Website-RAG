import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import chatRoutes from './routes/chat.js'
import crawlRoutes from './routes/crawl.js'
import authRoutes from './routes/auth.js'
import sessionRoutes from './routes/sessions.js'
import uploadRoutes from './routes/upload.js'
import connectDB from './config/db.js'

dotenv.config()


// Connect to Database
connectDB()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/crawl', crawlRoutes)
app.use('/api/chat', chatRoutes)

app.get('/health', (req, res) => {
    res.json({ status: 'OK' })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})