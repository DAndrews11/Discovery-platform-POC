import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await register(username, password);
      navigate('/');
    } catch (err) {
      setError('Registration failed. Please try a different username.');
    }
  };

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="platform-header platform-header--rounded-top">
          Discovery Platform
        </div>
        <div className="subheader">
          Register
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
              Register
            </button>
          </form>
          <div className="register-link">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="btn btn--link"
            >
              Login here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 