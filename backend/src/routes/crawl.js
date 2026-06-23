import express from 'express'
import { spawn } from 'child_process'
import path from 'path'
import { chunkText } from '../services/chunker.js'
import { generateEmbeddings } from '../services/embeddings.js'
import { addDocuments, deleteCollection } from '../services/vectordb.js'

const router = express.Router()

function runCrawler(url, maxPages = 30) {
  return new Promise((resolve, reject) => {
    const crawlerPath = path.join(process.cwd(), 'crawler', 'main.py')
    const process_ = spawn('python', [crawlerPath, url, String(maxPages)])

    let output = ''
    let errorOutput = ''

    process_.stdout.on('data', (data) => {
      output += data.toString()
    })

    process_.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    process_.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Crawler failed: ${errorOutput}`))
        return
      }
      try {
        const result = JSON.parse(output)
        resolve(result)
      } catch (e) {
        reject(new Error(`Failed to parse crawler output: ${output}`))
      }
    })
  })
}

router.post('/', async (req, res) => {
  const { url } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    console.log(`Crawling: ${url}`)
    const { pages, total_pages } = await runCrawler(url, 4)
    console.log(`Crawled ${total_pages} pages`)

    if (pages.length === 0) {
      return res.status(400).json({ error: 'No content found on website' })
    }

    const allChunks = []
    const allUrls = []

    for (const page of pages) {
      const chunks = chunkText(page.content)
      for (const chunk of chunks) {
        allChunks.push(chunk)
        allUrls.push(page.url)
      }
    }

    console.log(`Total chunks: ${allChunks.length}`)
    console.log('Generating embeddings...')
    const embeddings = await generateEmbeddings(allChunks)

    console.log('Storing in ChromaDB...')
    const urlHost = new URL(url).hostname.replace(/[^a-zA-Z0-9]/g, '_')
    const collectionName = 'site_' + urlHost.slice(0, 50)

    await deleteCollection(collectionName).catch(() => {})
    const stored = await addDocuments(collectionName, allChunks, embeddings, allUrls)

    res.json({
      success: true,
      collection: collectionName,
      pages_crawled: total_pages,
      chunks_stored: stored
    })

  } catch (error) {
    console.error('Crawl error:', error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router