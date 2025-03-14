import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.scss';

const Unauthorized: React.FC = () => {
    return (
        <div className="auth-container" style={{ minHeight: '45vh' }}>
            <div className="auth-box">
                <h1 className="auth-title error">401 Unauthorized</h1>
                <p className="auth-message">
                    Sorry, you don't have permission to access this page.
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="auth-button"
                >
                    Return to Home
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;