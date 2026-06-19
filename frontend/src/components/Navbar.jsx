import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-white font-bold text-lg leading-none">R</span>
                        </div>
                        <span className="font-bold text-lg text-white tracking-tight">Website RAG</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
                                    <span className="text-xs text-slate-400">Tokens:</span>
                                    <span className="text-sm font-bold text-indigo-400">{user.tokens}</span>
                                </div>
                                <span className="text-sm text-slate-400 hidden md:block">{user.email}</span>
                                <button 
                                    onClick={logout}
                                    className="text-sm text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm text-slate-300 hover:text-white transition">Log In</Link>
                                <Link to="/signup" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition shadow-md shadow-indigo-600/20">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
