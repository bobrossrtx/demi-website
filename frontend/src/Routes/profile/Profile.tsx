import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Profile.scss';

interface UserProfile {
    name: string;
    email: string;
    email_private: boolean;
    bio: string;
    profile_picture: string;
    profile_picture_public_id: string;
    created_at: string | null;
    updated_at: string | null;
}

const Profile: React.FC = () => {
    const { username } = useParams<{ username?: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userId = username ? username : "id:"+localStorage.getItem('user_id');
                const response = await fetch(`/api/auth/profile/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 404) {
                    navigate(`/404?reason=User: ${username} not found`);
                    return;
                }

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
    }, [username, useNavigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>{username ? `${username}'s Profile` : 'Your Profile'}</h1>
            </div>
            <div className="profile-content">
                <div className="profile-picture">
                    <img src={profile?.profile_picture} alt="Profile" />
                </div>
                <div className="profile-details">
                    <h2>{profile?.name}</h2>
                    <div className="profile-bio">
                        {profile?.bio.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>
                    {/* Only show email if viewing own profile or if email is not private */}
                    {!profile?.email_private || username === localStorage.getItem('user_id') ? (
                        <p>Email: {profile?.email}</p>
                    ) : (
                        <p>Email: Private</p>
                    )}
                    <p>Member since: {profile?.created_at?.split(" ")[0] ?? 'N/A'}</p>
                    {!username && (
                        <button 
                            className="edit-profile-button" 
                            onClick={() => window.location.href = '/profile/edit'}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;