import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
    const { user } = useContext(AuthContext);

    return (
        <div className="flex flex-col items-center w-full min-h-screen">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center pt-24 text-center px-4 w-full max-w-5xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-8 animate-fade-in">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    Now supporting PDF and Text Document uploads!
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-6 leading-tight">
                    Your Data. Your Answers.<br/> Instantly.
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12">
                    Index any website or upload your own documents. Ask complex questions and get accurate, context-aware answers with exact source citations in seconds.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    {user ? (
                        <Link to="/chat" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-indigo-600/20 text-center">
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold text-lg border border-slate-700 transition text-center">
                                Log In
                            </Link>
                            <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-indigo-600/20 text-center">
                                Start for Free
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Features Section */}
            <div className="w-full max-w-6xl mt-32 px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful RAG Capabilities</h2>
                    <p className="text-slate-400">Everything you need to extract knowledge from your data.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 text-2xl mb-6">🕸️</div>
                        <h3 className="text-xl font-bold text-white mb-3">Website Crawler</h3>
                        <p className="text-slate-400 leading-relaxed">Enter any URL. Our optimized python crawler traverses the site, extracts clean text, and ignores boilerplate automatically.</p>
                    </div>
                    <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 text-2xl mb-6">📄</div>
                        <h3 className="text-xl font-bold text-white mb-3">Document Uploads</h3>
                        <p className="text-slate-400 leading-relaxed">Upload PDFs or plain text files. We parse the documents securely and make them instantly searchable.</p>
                    </div>
                    <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition">
                        <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center text-pink-400 text-2xl mb-6">🧠</div>
                        <h3 className="text-xl font-bold text-white mb-3">Semantic Search</h3>
                        <p className="text-slate-400 leading-relaxed">Powered by ChromaDB and advanced embeddings to find the exact paragraphs that answer your question.</p>
                    </div>
                    <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 text-2xl mb-6">💬</div>
                        <h3 className="text-xl font-bold text-white mb-3">Conversational AI</h3>
                        <p className="text-slate-400 leading-relaxed">Chat naturally. The AI remembers context and provides precise answers based *only* on the provided data.</p>
                    </div>
                    <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 text-2xl mb-6">🔗</div>
                        <h3 className="text-xl font-bold text-white mb-3">Source Citations</h3>
                        <p className="text-slate-400 leading-relaxed">Never guess where an answer came from. Every response includes clickable links to the exact source material.</p>
                    </div>
                    <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 text-2xl mb-6">🕒</div>
                        <h3 className="text-xl font-bold text-white mb-3">Chat History</h3>
                        <p className="text-slate-400 leading-relaxed">All your sessions are saved. Pick up right where you left off with full conversation history and context.</p>
                    </div>
                </div>
            </div>

            {/* How it Works */}
            <div className="w-full max-w-5xl mt-32 px-4 mb-32">
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-10 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <h2 className="text-3xl font-bold text-white mb-10 text-center relative z-10">How It Works</h2>
                    
                    <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        <div className="flex-1 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-indigo-500 flex items-center justify-center text-2xl font-bold text-indigo-400 mb-6">1</div>
                            <h4 className="text-lg font-bold text-white mb-2">Provide Data</h4>
                            <p className="text-slate-400 text-sm">Enter a website URL to crawl or upload a PDF document directly.</p>
                        </div>
                        <div className="hidden md:flex flex-col justify-center items-center">
                            <div className="w-8 h-[2px] bg-slate-700"></div>
                        </div>
                        <div className="flex-1 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-purple-500 flex items-center justify-center text-2xl font-bold text-purple-400 mb-6">2</div>
                            <h4 className="text-lg font-bold text-white mb-2">We Index It</h4>
                            <p className="text-slate-400 text-sm">The data is chunked, converted to embeddings, and stored in our ultra-fast vector database.</p>
                        </div>
                        <div className="hidden md:flex flex-col justify-center items-center">
                            <div className="w-8 h-[2px] bg-slate-700"></div>
                        </div>
                        <div className="flex-1 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-pink-500 flex items-center justify-center text-2xl font-bold text-pink-400 mb-6">3</div>
                            <h4 className="text-lg font-bold text-white mb-2">You Chat</h4>
                            <p className="text-slate-400 text-sm">Ask anything. The LLM retrieves the exact context and gives you a cited answer.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full border-t border-slate-900 py-8 text-center text-slate-500 text-sm">
                <p>© {new Date().getFullYear()} Website RAG. Built for high-performance retrieval.</p>
            </footer>
        </div>
    );
}
