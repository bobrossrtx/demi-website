import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.scss';

const Login: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch('/api/auth/is_authenticated', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (data.authenticated) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuthentication();
  }, [navigate]);

  const { login, isAuthenticated } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Attempting to log in with credentials:", credentials);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);
        login(data.token, data.isAdmin);
        navigate('/profile');
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData);
        setError(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Login</h1>
          <p>Enter your credentials to access your profile</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

            {/* show the ?message= and ?status= */}
            {(window.location.search.includes('message=') && window.location.search.includes('status=')) && (
            <div
              className={`auth-message ${
              new URLSearchParams(window.location.search).get('status') === 'error'
                ? 'error'
                : 'success'
              }`}
            >
              {new URLSearchParams(window.location.search).get('message')}
            </div>
            )}
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register</Link></p>
          <p><Link to="/forgot-password">Forgot Password?</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
