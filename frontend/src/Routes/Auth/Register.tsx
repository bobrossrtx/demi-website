import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import emailjs from 'emailjs-com';
import PasswordStrengthBar, { calculatePasswordStrength } from '../../Components/PasswordStrengthBar/PasswordStrengthBar';
import './Auth.scss';

const Register: React.FC = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setError('Invalid email format');
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate new password
    const password = userData.password;
    const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const numberRegex = /[0-9]/;
    const letterRegex = /[a-zA-Z]/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (!specialCharacterRegex.test(password)) {
      setError('Password must contain at least 1 special character');
      setLoading(false);
      return;
    }

    if (!numberRegex.test(password) || !letterRegex.test(password)) {
      setError('Password must contain both numbers and letters');
      setLoading(false);
      return;
    }

    if (!uppercaseRegex.test(password) || !lowercaseRegex.test(password)) {
      setError('Password must contain both uppercase and lowercase letters');
      setLoading(false);
      return;
    }

    try {
      // Register the user and get the verification token
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          bio: "No Bio Available",
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      const { token } = await response.json();

      // Send the verification email
      const templateParams = {
        subject: 'Verify Your Account',
        name: userData.username,
        to_email: userData.email,
        first_line: `Dear ${userData.username},`,
        second_line: 'Thank you for registering. Please verify your account by clicking the link below:',
        last_line: 'Best regards, Demi Team',
        verification_link: `${window.location.origin}/verify-account?token=${token}`,
      };

      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID!,
        'template_rzeeiid',
        templateParams,
        process.env.REACT_APP_EMAILJS_USER_ID!
      );

      navigate('/login?message=Registration successful! Please check your email to verify your account.&status=success');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Register to access the Demi community</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
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
              value={userData.password}
              onChange={handleChange}
              required
            />
            <PasswordStrengthBar strength={calculatePasswordStrength(userData.password)} />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Log In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;