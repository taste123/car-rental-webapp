import React, { useState } from 'react';
import { loginUser } from "../services/api.js";


function LoginPage({ onLogin, onNavigate }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Panggil fungsi loginUser yang sudah diisolasi
            const data = await loginUser(username, password);
            onLogin(data.access_token); // Panggil fungsi onLogin dari App.jsx
            onNavigate('home'); // Navigate to HomePage after login
        } catch (err) {
            setError(err.message); // Tangkap error yang dilempar dari fungsi API
            console.error("Login fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center mt-10">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-gray-900">Login</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-sm text-center text-red-600">{error}</p>}
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-bold text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                            {isLoading ? 'Loading...' : 'Sign In'}
                        </button>
                    </div>
                    <p className="text-sm text-center text-gray-600">
                        Belum punya akun?{' '}
                        <button type="button" onClick={() => onNavigate('register')} className="font-medium text-sky-600 hover:text-sky-500">
                            Register di sini
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
