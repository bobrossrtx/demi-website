import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sent.scss';

const Sent: React.FC = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const sent = params.get('success') === 'true';
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;

        // Function to handle responsive scrolling
        const handleScrolling = () => {
            const currentWidth = window.innerWidth;
            setWindowWidth(currentWidth);
            
            if (currentWidth > 1356) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        };

        // Set Initial State
        handleScrolling();

        // Add event listener for window resize
        window.addEventListener('resize', handleScrolling);
        
        // Cleanup function
        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('resize', handleScrolling);
        };
    }, []);

    return (
        <div className="container">
            {sent ? (
                <>
                    <svg
                        className="success-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    <h1 className="sent-title">Message Sent Successfully!</h1>
                    <p className="sent-message">
                        Thank you for contacting us. We will get back to you as soon as possible.
                    </p>
                </>
            ) : (
                <>
                    <svg
                        className="error-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                    <h1 className="sent-title">Error Sending Message</h1>
                    <p className="sent-message">
                        Sorry, there was a problem sending your message. Please try again.
                    </p>
                </>
            )}
            <button onClick={() => window.location.href = '/'} className="back-button">
                Return to Home
            </button>
        </div>
    );
};

export default Sent;
