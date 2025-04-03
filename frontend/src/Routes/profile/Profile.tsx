import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Profile.scss';
import { useAuth } from '../../context/AuthContext';

interface UserProfile {
    username: string;
    email: string;
    email_private: boolean;
    bio: string;
    profile_picture: string;
    profile_picture_public_id: string;
    created_at: string | null;
    updated_at: string | null;
    id: string; // Added id to UserProfile interface
}

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { username } = useParams<{ username?: string }>();
    const [profile, setProfile] = useState<UserProfile>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const userId = profile?.id || ''; // Use the fetched profile data to get the user ID

    React.useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await fetch('/api/auth/is_authenticated', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                console.log("Authentication check response:", data);
                if (data.authenticated) {
                    return true
                } else {
                    return false;
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                return false;
            }
        };
    
        // const fetchUserData = async () => {
        //     try {
        //         if (username && username.length > 0) {
        //             // Fetch the profile using the username from the route parameter
        //             const profileResponse = await fetch(`/api/auth/profile/${username}`, {
        //                 method: 'GET',
        //                 credentials: 'include',
        //             });

        //             if (!profileResponse.ok) {
        //                 throw new Error('Failed to fetch profile by username');
        //             }

        //             const profileData = await profileResponse.json();
        //             setProfile(profileData);
        //         } else {
        //             console.log("no username provided, fetching user data using refresh token");
        //             checkAndFetchOwnProfile();
        //         }
        //     } catch (error) {
        //         console.error('Error fetching user data and profile:', error);
        //         setError('Error fetching user data and profile. Please try again.');
        //     } finally {
        //         setLoading(false);
        //     }
        // };

        const fetchProfileData = async () => {
            try {
                const profileResponse = await fetch(`/api/auth/profile/${username}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!profileResponse.ok) {
                    throw new Error('Failed to fetch profile by username');
                }

                const profileData = await profileResponse.json();
                setProfile(profileData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching profile data:', error);
                setError('Error fetching profile data. Please try again.');
            }
        };

        const checkAndFetchOwnProfile = async () => {
            try {
                const response = await fetch('/api/auth/user-by-refresh-token', {
                    method: 'POST',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const userData = await response.json();
                setProfile(userData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching own profile data:', error);
                setError('Error fetching own profile data. Please try again.');
            }
        };

        if (username) {
            // Viewing someone else's profile, just fetch their data
            console.log("Fetching profile data for username:", username);
            fetchProfileData();
        } else {
            // Viewing own profile, check auth first, then fetch data
            console.log("no username provided, fetching user data using refresh token");
            checkAuthentication().then(isAuthenticated => {
                if (!isAuthenticated) {
                    navigate('/login');
                    return;
                }
                console.log("User is authenticated, fetching own profile data");
            });
            checkAndFetchOwnProfile();
        }
    }, [navigate, username]); // Dependencies: navigate and username

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
                    <h3>{profile?.username}</h3>
                    <div className="profile-bio">
                        {profile?.bio.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>
                    {/* Only show email if viewing own profile or if email is not private */}
                    {!profile?.email_private || username === userId ? (
                        <p>Email: {profile?.email}</p>
                    ) : (
                        <p>Email: Hidden for Privacy</p>
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