import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="page-container">
            <div className="content-wrapper">
                <div className="platform-header platform-header--rounded-top">
                    Discovery Platform
                </div>
                <div className="subheader">
                    Login
                </div>
                <div className="card card--rounded-bottom">
                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-group">
                            <label htmlFor="username" className="form-label">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <button type="submit" className="btn btn--primary btn--full">
                            Login
                        </button>
                    </form>
                    <div className="register-link">
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/register')}
                            className="btn btn--link"
                        >
                            Register here
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage; 