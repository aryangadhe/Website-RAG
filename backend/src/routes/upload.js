import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { chunkText } from '../services/chunker.js';
import { generateEmbeddings } from '../services/embeddings.js';
import { addDocuments, deleteCollection } from '../services/vectordb.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/document', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        let textContent = '';

        if (file.mimetype === 'application/pdf') {
            const pdfData = await pdfParse(file.buffer);
            textContent = pdfData.text;
        } else if (file.mimetype === 'text/plain') {
            textContent = file.buffer.toString('utf-8');
        } else {
            return res.status(400).json({ error: 'Only PDF and TXT files are supported' });
        }

        if (!textContent.trim()) {
            return res.status(400).json({ error: 'Could not extract text from file' });
        }

        console.log(`Processing file: ${file.originalname}`);
        
        const chunks = chunkText(textContent);
        console.log(`Generated ${chunks.length} chunks. Getting embeddings...`);
        
        const embeddings = await generateEmbeddings(chunks);
        
        const safeName = file.originalname.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
        const collectionName = `doc_${safeName}_${Date.now()}`;
        const sourceUrls = Array(chunks.length).fill(file.originalname); // use filename as source

        await deleteCollection(collectionName).catch(() => {});
        const stored = await addDocuments(collectionName, chunks, embeddings, sourceUrls);

        res.json({
            success: true,
            collection: collectionName,
            chunks_stored: stored,
            filename: file.originalname
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
