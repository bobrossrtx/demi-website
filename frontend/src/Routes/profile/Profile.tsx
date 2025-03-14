import React, { useEffect, useState } from 'react';
import './Profile.scss';

const Profile: React.FC = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        bio: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userId = localStorage.getItem('user_id');
                const response = await fetch(`/api/auth/profile/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const data = await response.json();
                setProfile(data);
                setLoading(false);
            } catch (error) {
                setError('Error fetching profile. Please try again.');
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Your Profile</h1>
            </div>
            <div className="profile-content">
                <div className="profile-picture">
                    <img src="path_to_profile_picture" alt="Profile" />
                </div>
                <div className="profile-details">
                    <h2>{profile.name}</h2>
                    <p>Email: {profile.email}</p>
                    <p>Bio: {profile.bio}</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;