import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.scss';

const Logout = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        console.log("Logout component mounted. Initiating logout...");

        const performLogout = async () => {
            try {
                // Call the backend logout endpoint to clear the refresh token
                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include',
                });

                if (!response.ok) {
                    console.error('Failed to log out from the server');
                }
            } catch (error) {
                console.error('Error during logout:', error);
            } finally {
                // Perform client-side logout
                logout();
                navigate('/login');
            }
        };

        performLogout();
    }, [logout, navigate]);

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
