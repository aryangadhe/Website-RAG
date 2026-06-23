import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/chat');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center pt-20 px-4">
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>
                {error && <div className="bg-rose-950/40 border border-rose-900 text-rose-400 p-3 rounded-lg text-sm mb-4">{error}</div>}
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs text-slate-400 font-semibold uppercase">Email</label>
                        <input 
                            type="email" 
                            required
                            disabled={loading}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition disabled:opacity-50"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-semibold uppercase">Password</label>
                        <input 
                            type="password" 
                            required
                            disabled={loading}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition disabled:opacity-50"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg mt-2 transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Logging in...</span>
                            </>
                        ) : (
                            'Log In'
                        )}
                    </button>
                </form>
                <p className="text-slate-400 text-sm mt-6 text-center">
                    Don't have an account? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
