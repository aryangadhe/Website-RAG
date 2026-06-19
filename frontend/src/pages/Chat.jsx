import { useState, useEffect, useRef, useContext } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { AuthContext } from '../context/AuthContext'

const API = 'http://localhost:3000/api'

export default function Chat() {
  const { updateTokens, user } = useContext(AuthContext)
  
  // State for Sidebar & Sessions
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Modes
  const [mode, setMode] = useState('website') // 'website' or 'document'

  // Input States
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  
  // Current Chat State
  const [collection, setCollection] = useState('')
  const [activeSource, setActiveSource] = useState('') // URL or Filename
  const [crawlStatus, setCrawlStatus] = useState(null)
  const [crawling, setCrawling] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [showTokenPopup, setShowTokenPopup] = useState(false)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  async function fetchSessions() {
    try {
      const res = await axios.get(`${API}/sessions`)
      setSessions(res.data)
    } catch (err) {
      console.error("Failed to fetch sessions")
    }
  }

  async function loadSession(sessionId) {
    try {
      const res = await axios.get(`${API}/sessions/${sessionId}`)
      const session = res.data
      setActiveSessionId(session._id)
      setMode(session.type)
      setCollection(session.collectionName)
      setActiveSource(session.source)
      setMessages(session.messages || [])
      setCrawlStatus(null)
      if(window.innerWidth < 768) setIsSidebarOpen(false) // auto close on mobile
    } catch (err) {
      console.error("Failed to load session")
    }
  }

  function handleReset() {
    setCollection('')
    setActiveSource('')
    setCrawlStatus(null)
    setMessages([])
    setUrl('')
    setFile(null)
    setActiveSessionId(null)
  }

  async function handleCrawl() {
    if (!url) return
    let targetUrl = url.trim()
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl
    }

    setCrawling(true)
    setCrawlStatus(null)

    try {
      const res = await axios.post(`${API}/crawl`, { url: targetUrl })
      
      // Create Session
      const sessionRes = await axios.post(`${API}/sessions`, {
        title: cleanDisplayUrl(targetUrl),
        type: 'website',
        collectionName: res.data.collection,
        source: targetUrl
      })

      setCollection(res.data.collection)
      setActiveSource(targetUrl)
      setActiveSessionId(sessionRes.data._id)
      fetchSessions()

      setCrawlStatus({
        success: true,
        pages: res.data.pages_crawled,
        chunks: res.data.chunks_stored
      })
    } catch (err) {
      setCrawlStatus({ success: false, error: err.response?.data?.error || 'Crawl failed.' })
    } finally {
      setCrawling(false)
    }
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return

    setCrawling(true)
    setCrawlStatus(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post(`${API}/upload/document`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Create Session
      const sessionRes = await axios.post(`${API}/sessions`, {
        title: file.name,
        type: 'document',
        collectionName: res.data.collection,
        source: file.name
      })

      setCollection(res.data.collection)
      setActiveSource(file.name)
      setActiveSessionId(sessionRes.data._id)
      fetchSessions()

      setCrawlStatus({
        success: true,
        chunks: res.data.chunks_stored
      })
    } catch (err) {
      setCrawlStatus({ success: false, error: err.response?.data?.error || 'Upload failed.' })
    } finally {
      setCrawling(false)
    }
  }

  async function handleChat() {
    if (!question || !collection) return
    const userMessage = question
    setQuestion('')
    
    const updatedMessages = [...messages, { role: 'user', text: userMessage }]
    setMessages(updatedMessages)
    setLoading(true)

    try {
      const res = await axios.post(`${API}/chat`, { 
        question: userMessage, 
        collection,
        history: messages,
        sessionId: activeSessionId
      })
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: res.data.answer,
        sources: res.data.sources
      }])

      if (res.data.tokensRemaining !== undefined) {
          updateTokens(res.data.tokensRemaining)
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.code === 'TOKEN_EXHAUSTED') {
          setShowTokenPopup(true)
          setMessages(prev => prev.slice(0, -1)) 
      } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            text: 'Error: ' + (err.response?.data?.error || 'Something went wrong.'),
            sources: []
          }])
      }
    } finally {
      setLoading(false)
    }
  }

  const cleanDisplayUrl = (str) => {
    if (!str) return 'Unknown'
    if (!str.startsWith('http')) return str // probably a filename
    try {
      const u = new URL(str)
      return u.hostname
    } catch (e) {
      return str
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden w-full absolute left-0">
        
        {/* Token Exhausted Popup */}
        {showTokenPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-sm text-center shadow-2xl">
                    <div className="text-5xl mb-4">⏳</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Tokens Exhausted</h2>
                    <p className="text-slate-400 mb-6">You have run out of AI chat tokens. You cannot send further messages until your balance is refilled.</p>
                    <button 
                        onClick={() => setShowTokenPopup(false)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        )}

        {/* Sidebar for Sessions */}
        <div className={`bg-slate-950 border-r border-slate-800 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64 min-w-[256px]' : 'w-0 overflow-hidden'}`}>
            <div className="p-4 border-b border-slate-900 flex justify-between items-center">
                <h3 className="font-bold text-slate-200">Past Chats</h3>
                <button onClick={handleReset} className="text-indigo-400 hover:text-indigo-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 p-2 flex flex-col gap-1">
                {sessions.map(s => (
                    <button 
                        key={s._id}
                        onClick={() => loadSession(s._id)}
                        className={`text-left px-3 py-3 rounded-xl text-sm truncate transition ${activeSessionId === s._id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
                    >
                        <div className="font-semibold truncate">{s.title}</div>
                        <div className="text-[10px] uppercase tracking-wider opacity-70 mt-1">{s.type === 'website' ? '🕸️ Website' : '📄 Document'}</div>
                    </button>
                ))}
                {sessions.length === 0 && (
                    <div className="text-slate-500 text-sm p-4 text-center">No past chats</div>
                )}
            </div>
        </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-950 relative">
        {/* Toggle Sidebar Button */}
        <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-4 left-4 z-10 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 p-2 rounded-lg shadow-lg"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
        </button>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-3xl flex flex-col gap-6 pt-12 md:pt-0">
                
                {/* Mode Selector and Setup */}
                {!collection && (
                <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl mt-8">
                    
                    {/* Tabs */}
                    <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
                        <button 
                            onClick={() => { setMode('website'); setCrawlStatus(null) }}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === 'website' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            🕸️ Website RAG
                        </button>
                        <button 
                            onClick={() => { setMode('document'); setCrawlStatus(null) }}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === 'document' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            📄 Document RAG
                        </button>
                    </div>

                    {mode === 'website' ? (
                        <div className="flex flex-col gap-4 animate-fade-in">
                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                Target Website URL
                            </label>
                            <div className="flex gap-3">
                                <input
                                type="text"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleCrawl()}
                                placeholder="e.g. docs.github.com or https://example.com"
                                className="flex-1 bg-slate-950/80 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                disabled={crawling}
                                />
                                <button
                                onClick={handleCrawl}
                                disabled={crawling || !url}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-semibold transition shadow-lg"
                                >
                                {crawling ? 'Crawling...' : 'Crawl & Index'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 animate-fade-in">
                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                Upload PDF or TXT
                            </label>
                            <form onSubmit={handleUpload} className="flex gap-3">
                                <input
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={e => setFile(e.target.files[0])}
                                    className="flex-1 bg-slate-950/80 text-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none border border-slate-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30"
                                    disabled={crawling}
                                />
                                <button
                                    type="submit"
                                    disabled={crawling || !file}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-semibold transition shadow-lg"
                                >
                                {crawling ? 'Processing...' : 'Upload & Index'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Status Message */}
                    {crawlStatus && (
                    <div className={`mt-4 text-sm rounded-xl px-4 py-3 border ${
                        crawlStatus.success 
                        ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40' 
                        : 'bg-rose-950/20 text-rose-400 border-rose-900/40'
                    }`}>
                        {crawlStatus.success
                        ? `✅ Success! Indexed and ready. ${crawlStatus.pages ? `Pages: ${crawlStatus.pages}` : ''}`
                        : `❌ Failed: ${crawlStatus.error}`}
                    </div>
                    )}
                </div>
                )}

                {/* Chat Interface */}
                {collection && (
                <div className="flex-1 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 flex flex-col shadow-2xl overflow-hidden min-h-[400px]">
                    
                    {/* Active source info */}
                    <div className="bg-slate-900/70 border-b border-slate-800/70 px-5 py-3.5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-slate-300 font-medium tracking-wide">
                            {mode === 'website' ? 'Active Site: ' : 'Active Doc: '}
                            <strong className="text-indigo-400 font-semibold">{cleanDisplayUrl(activeSource)}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Message Area */}
                    <div className="flex-1 flex flex-col gap-6 p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center py-20 px-4">
                            <div className="bg-indigo-950/20 border border-indigo-900/40 text-indigo-400 p-3.5 rounded-2xl mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l8.172-3.415m0 0l-3.04-3.04m3.04 3.04L7.542 16.541m9.314-8.214l-8.172 3.415m0 0L3.109 8.684m0 0L7.542 4.25M3.109 8.68m0 0l3.04 3.04m-3.04-3.04l8.172 3.415" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-slate-200 text-base">Start the conversation</h3>
                            <p className="text-xs text-slate-500 max-w-sm mt-1">Each message costs 1 token.</p>
                        </div>
                    )}
                    
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                        <div className={`px-4.5 py-3 rounded-2xl text-sm max-w-[85%] leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm' 
                                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                            }`}
                        >
                            {msg.role === 'user' ? (
                            <span className="whitespace-pre-wrap">{msg.text}</span>
                            ) : (
                            <ReactMarkdown
                                components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold text-indigo-200">{children}</strong>,
                                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-slate-300">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-slate-300">{children}</ol>,
                                li: ({ children }) => <li className="text-slate-300">{children}</li>,
                                h1: ({ children }) => <h1 className="text-lg font-bold text-slate-100 mb-2 mt-1">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-semibold text-slate-100 mb-2 mt-1">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-200 mb-1">{children}</h3>,
                                code: ({ children }) => <code className="bg-slate-955 text-indigo-400 px-1.5 py-0.5 rounded text-xs border border-slate-800 font-mono">{children}</code>,
                                }}
                            >
                                {msg.text}
                            </ReactMarkdown>
                            )}
                        </div>

                        {msg.sources && msg.sources.length > 0 && mode === 'website' && (
                            <div className="flex flex-wrap gap-1.5 mt-1 max-w-[85%]">
                            {msg.sources.map((src, j) => (
                                <a key={j} href={src} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-300 hover:text-white bg-indigo-950/20 border border-indigo-900/40 px-2 py-0.5 rounded-full">
                                {cleanDisplayUrl(src)}
                                </a>
                            ))}
                            </div>
                        )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex items-start animate-fade-in">
                            <div className="flex space-x-1.5 items-center bg-slate-900 border border-slate-800 text-slate-400 px-4.5 py-3 rounded-2xl rounded-tl-sm text-sm">
                                <span className="text-xs font-medium text-slate-400">Thinking</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Field */}
                    <div className="border-t border-slate-800/80 p-4 bg-slate-900/30 flex gap-3">
                    <input
                        type="text"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleChat()}
                        placeholder={loading ? "Waiting..." : "Ask a question..."}
                        disabled={loading}
                        className="flex-1 bg-slate-950 text-slate-200 rounded-xl px-4 py-3 text-sm outline-none border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-40"
                    />
                    <button
                        onClick={handleChat}
                        disabled={loading || !question.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:opacity-40 text-white px-6 py-3 rounded-xl text-sm font-semibold transition"
                    >
                        Send
                    </button>
                    </div>
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}
