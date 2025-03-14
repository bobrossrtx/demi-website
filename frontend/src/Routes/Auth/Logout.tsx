import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.scss';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.clear();
        navigate('/login');
    }, [navigate]);

    return (
        <div className="auth-container">
            <div className="auth-form-container">
                <h2>Logging out...</h2>
                <p>You are being redirected to the login page.</p>
            </div>
        </div>
    );
};

export default Logout;
