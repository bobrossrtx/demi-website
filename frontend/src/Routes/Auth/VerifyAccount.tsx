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
                        window.location.href = '/login';
                    } else {
                        window.location.href = '/login';
                    }
                })
                .catch(() => {
                    window.location.href = '/login';
                });
        } else {
            window.location.href = '/login';
        }
    }, [location]);

    return null;
};

export default VerifyAccount;