import { useState } from 'react';

function AuthParams({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            if (isLogin) {
                // Save the token to local storage
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                onLogin(data.username);
            } else {
                // If registered, switch to login view
                alert('Registration successful! Please log in.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-center text-white mb-6">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            
            {error && <div className="bg-red-600 text-white p-2 rounded mb-4 text-center">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-400 mb-1">Username</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                        required 
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                        required 
                    />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition">
                    {isLogin ? 'Log In' : 'Sign Up'}
                </button>
            </form>

            <div className="mt-4 text-center">
                <button 
                    onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                    className="text-blue-400 hover:text-blue-300 text-sm"
                >
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                </button>
            </div>
        </div>
    );
}

export default AuthParams;