import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import emailjs from 'emailjs-com';
import './Auth.scss';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [new_password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
    const [hasToken, setHasToken] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        setHasToken(!!token);
    }, [location]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/auth/generate-reset-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate reset token');
            }

            const { token: generated_token } = await response.json();

            const templateParams = {
                subject: 'Password Reset Request',
                name: email,
                to_email: email,
                first_line: 'Dear User,',
                second_line: 'We received a request to reset your password. Please click the link below to reset your password.',
                last_line: 'Best regards, Demi Team',
                reset_link: `${window.location.origin}/forgot-password?token=${generated_token}`,
            };

            await emailjs.send(
                process.env.REACT_APP_EMAILJS_SERVICE_ID!,
                'template_rzeeiid',
                templateParams,
                process.env.REACT_APP_EMAILJS_USER_ID!
            );

            setMessage('Password reset link has been sent to your email.');
            setMessageType('success');
            setEmail('');
        } catch (error) {
            setMessage('Error sending reset link. Please try again.');
            setMessageType('error');
            console.error('Error:', error);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (new_password !== confirmPassword) {
            setMessage('Passwords do not match');
            setMessageType('error');
            return;
        }

        try {
            const token = new URLSearchParams(location.search).get('token');
            const response = await fetch(`/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, new_password }),
            });

            if (!response.ok) {
                throw new Error('Failed to reset password');
            }

            setMessage('Password has been successfully reset.');
            setMessageType('success');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            setMessage('Error resetting password. Please try again.');
            setMessageType('error');
            console.error('Error:', error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Forgot Password</h1>
                    <p>{hasToken ? 'Enter your new password' : 'Enter your email to reset your password'}</p>
                </div>
                <form className="auth-form" onSubmit={hasToken ? handlePasswordReset : handleEmailSubmit}>
                    {!hasToken ? (
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    ) : (
                        <>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={new_password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}
                    {message && <div className={`auth-message ${messageType}`}>{message}</div>}
                    <button type="submit" className="auth-button">
                        {hasToken ? 'Reset Password' : 'Send Reset Link'}
                    </button>
                </form>
                <div className="auth-footer">
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;