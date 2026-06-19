export function chunkText(text, chunkSize = 4000, chunkOverlap = 400) {
    if (!text) return []
    const separators = ['\n\n', '\n', ' ', '']
    const chunks = []

    function splitRecursive(content, separatorIndex) {
        if (content.length <= chunkSize) {
            return [content]
        }
        if (separatorIndex >= separators.length) {
            const hardChunks = []
            for (let i = 0; i < content.length; i += chunkSize - chunkOverlap) {
                hardChunks.push(content.slice(i, i + chunkSize))
            }
            return hardChunks
        }

        const separator = separators[separatorIndex]
        const parts = content.split(separator)
        const result = []
        let currentChunk = ''

        for (const part of parts) {
            if (currentChunk.length + part.length + (currentChunk ? separator.length : 0) <= chunkSize) {
                currentChunk += (currentChunk ? separator : '') + part
            } else {
                if (currentChunk) {
                    result.push(currentChunk)
                }
                if (part.length > chunkSize) {
                    const subChunks = splitRecursive(part, separatorIndex + 1)
                    result.push(...subChunks)
                    currentChunk = ''
                } else {
                    currentChunk = part
                }
            }
        }
        if (currentChunk) {
            result.push(currentChunk)
        }
        return result
    }

    const rawSplits = splitRecursive(text, 0)
    let currentChunk = ''
    
    for (const split of rawSplits) {
        const trimmed = split.trim()
        if (!trimmed) continue
        
        if (!currentChunk) {
            currentChunk = trimmed
        } else if (currentChunk.length + trimmed.length + 1 <= chunkSize) {
            currentChunk += '\n' + trimmed
        } else {
            chunks.push(currentChunk)
            const overlapStart = Math.max(0, currentChunk.length - chunkOverlap)
            const overlapText = currentChunk.slice(overlapStart)
            const spaceIdx = overlapText.indexOf(' ')
            const cleanOverlap = spaceIdx !== -1 ? overlapText.slice(spaceIdx + 1) : overlapText
            currentChunk = (cleanOverlap ? cleanOverlap + '\n' : '') + trimmed
        }
    }
    if (currentChunk.trim()) {
        chunks.push(currentChunk)
    }

    return chunks
}