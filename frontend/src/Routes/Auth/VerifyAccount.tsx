import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const VerifyAccount: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        const token = new URLSearchParams(location.search).get('token');
        if (token) {
            fetch(`/api/auth/verify-account?token=${token}`)
                .then((res) => {
                    if (res.ok) {
                        window.location.href = '/login?message=Account verified successfully. You can now log in.&status=success';
                    } else {
                        window.location.href = '/login?message=Account verification failed. Please try again.&status=error';
                    }
                })
                .catch(() => {
                    window.location.href = '/login?message=An error occurred. Please try again later.&status=error';
                });
        } else {
            window.location.href = '/login?message=Invalid verification link. Please check your email for the correct link.&status=error';
        }
    }, [location]);

    return null;
};

export default VerifyAccount;