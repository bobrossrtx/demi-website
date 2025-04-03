import React, { useEffect, useState, useRef } from 'react';
import './EditProfile.scss';
import PasswordStrengthBar, { calculatePasswordStrength } from '../../Components/PasswordStrengthBar/PasswordStrengthBar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
    username: string;
    email: string;
    email_private: boolean;
    bio: string;
    profile_picture: string;
    profile_picture_public_id: string;
    created_at: string | null;
    updated_at: string | null;
    verified: boolean;
}

const EditProfile: React.FC = () => {
    const navigate = useNavigate();

    const [profile, setProfile] = useState<UserProfile>({
        username: '',
        email: '',
        email_private: false,
        bio: '',
        profile_picture: '',
        profile_picture_public_id: '',
        created_at: '',
        updated_at: '',
        verified: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [passwordData, setPasswordData] = useState({
        previous_password: '',
        new_password: '',
        confirm_new_password: ''
    });
    const [passwordStrength, setPasswordStrength] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [deletePasswordData, setDeletePasswordData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        const checkAuthAndFetchProfile = async () => {
            setLoading(true);
            setError('');
            try {
                // 1. Check authentication status
                const authResponse = await fetch('/api/auth/is_authenticated', {
                    method: 'GET',
                    credentials: 'include',
                });
                const authData = await authResponse.json();

                if (!authData.authenticated) {
                    console.log("User not authenticated, redirecting to login.");
                    navigate('/login');
                    return; // Stop execution if not authenticated
                }

                // 2. If authenticated, fetch user data for editing
                const response = await fetch('/api/auth/user-by-refresh-token', {
                    method: 'POST',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data for editing');
                }

                const userData = await response.json();
                console.log("User data fetched successfully for editing:", userData);
                setProfile(userData);
                setPreviewImage(userData.profile_picture);

            } catch (error: any) {
                console.error('Error during auth check or profile fetch:', error);
                setError(error.message || 'Error loading profile editor. Please try again.');
                // Optionally navigate away or show a more specific error
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndFetchProfile();
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prevData => ({
            ...prevData,
            [name]: value
        }));
        // Clear any previous errors when user starts typing again
        setPasswordError('');

        if (name === 'new_password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/auth/user-by-refresh-token', {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            const userId = userData.id;

            const updateResponse = await fetch(`/api/auth/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profile),
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update profile');
            }

            window.location.href = '/profile';
        } catch (error) {
            setError('Error updating profile. Please try again.');
            console.error('Error updating profile:', error);
        }
    };

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            
            // Create a preview of the selected image
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfilePictureUpload = async () => {
        if (!selectedFile) {
            alert('Please select an image first'); // Change this to use your preferred alert method
            return;
        }

        try {
            const userId = localStorage.getItem('user_id');

            // Delete the old profile picture
            if (profile.profile_picture_public_id !== '' && profile.profile_picture_public_id !== ".tmpOhIOAf.jpg") {
                const response = await fetch(`/api/auth/profile/${userId}/profile_picture`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ public_id: profile.profile_picture_public_id }),
                });

                if (!response.ok) {
                    throw new Error('Failed to delete old profile picture');
                }
            }

            const formData = new FormData();
            formData.append('profile_picture', selectedFile);

            const response = await fetch(`/api/auth/profile/edit/${userId}/profile_picture`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload profile picture');
            }

            const data = await response.json();
            
            // Update the profile with the new profile picture URL and public_id
            setProfile(prevProfile => ({
                ...prevProfile,
                profile_picture: data.profile_picture,
                profile_picture_public_id: data.profile_picture_public_id,
            }));
            
            setShowPopup(false);
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            setError('Error uploading profile picture. Please try again.');
        }
    };

    const handleDeletePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDeletePasswordData(prevData => ({
            ...prevData,
            [name]: value
        }));
        setDeleteError('');
    };

    const handleDeleteProfile = async () => {
        // Validate passwords match
        if (deletePasswordData.password !== deletePasswordData.confirmPassword) {
            setDeleteError('Passwords do not match');
            return;
        }

        // Validate password is entered
        if (!deletePasswordData.password) {
            setDeleteError('Please enter your current password');
            return;
        }

        try {
            const response = await fetch('/api/auth/user-by-refresh-token', {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            const userId = userData.id;

            const deleteResponse = await fetch(`/api/auth/profile/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: deletePasswordData.password
                }),
            });

            if (!deleteResponse.ok) {
                const errorData = await deleteResponse.json();
                throw new Error(errorData.message || 'Failed to delete profile');
            }

            // Call logout function to clear the refresh token
            const logoutResponse = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            // Check if logout was successful
            if (!logoutResponse.ok) {
                throw new Error('Failed to log out');
            }

            window.location.href = '/';
        } catch (error) {
            if (error instanceof Error) {
                setDeleteError(error.message);
            } else {
                setDeleteError('An unexpected error occurred.');
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Edit Profile</h1>
            </div>
            <form className="profile-content" onSubmit={handleSubmit}>
                <div className="profile-picture" onClick={() => setShowPopup(true)}>
                    <div className="profile-picture-overlay"></div>
                    <img src={profile.profile_picture} alt="Profile" />
                    <div className="edit-icon">
                        <i className="fas fa-pencil-alt"></i>
                    </div>
                </div>
                {showPopup && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <div className="popup-header">
                                <h2>Change Profile Picture:</h2>
                                <div className="profile-picture-preview">
                                    <img src={previewImage} alt="Profile" />
                                    <div className="overlay" />
                                </div>
                            </div>

                            <p>Recommended picture size: 200x200 pixels</p>
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePictureChange}
                            />
                            <button type="button" onClick={handleProfilePictureUpload}>Upload</button>
                            <button type="button" onClick={() => setShowPopup(false)}>Cancel</button>
                        </div>
                    </div>
                )}
                {showDeletePopup && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <div className="popup-header">
                                <h2>Delete Profile Confirmation</h2>
                            </div>
                            <p>Are you sure you want to delete your profile? This action cannot be undone.</p>
                            <p>Please enter your current password to confirm:</p>
                            
                            {deleteError && <div className="error-message">{deleteError}</div>}
                            
                            <label className="delete-profile-label">
                                Current Password:
                                <input
                                    className="delete-profile-input"
                                    type="password"
                                    name="password"
                                    value={deletePasswordData.password}
                                    onChange={handleDeletePasswordChange}
                                />
                            </label>
                            <label className="delete-profile-label">
                                Confirm Password:
                                <input
                                    className="delete-profile-input"
                                    type="password"
                                    name="confirmPassword"
                                    value={deletePasswordData.confirmPassword}
                                    onChange={handleDeletePasswordChange}
                                />
                            </label>
                            
                            <div className="popup-buttons">
                                <button 
                                    type="button" 
                                    className="delete-confirm-button" 
                                    onClick={handleDeleteProfile}
                                >
                                    Delete Profile
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowDeletePopup(false);
                                        setDeletePasswordData({ password: '', confirmPassword: '' });
                                        setDeleteError('');
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="edit-profile-details">
                    <div className="left">
                        <label className="profile-label">
                            Username:
                            <input
                                className="profile-input"
                                type="text"
                                name="username"
                                value={profile.username}
                                onChange={handleChange}
                            />
                        </label>
                        <label className="profile-label">
                            Email:
                            <input
                                className="profile-input"
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleChange}
                            />
                        </label>
                        <label className="profile-label-checkbox">
                            Make email private
                            <input
                                type="checkbox"
                                name="email_private"
                                checked={profile.email_private}
                                onChange={(e) => setProfile((prevProfile) => ({
                                    ...prevProfile,
                                    email_private: e.target.checked,
                                }))}
                            />
                        </label>
                        <label className="profile-label">
                            Bio:
                            <textarea
                                className="profile-textarea"
                                name="bio"
                                value={profile.bio}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div className="divider" />
                    <div className="right">
                        <h2>Change Password:</h2>
                        {passwordError && <div className="error-message">{passwordError}</div>}
                        {error && <div className="error-message">{error}</div>}
                        <label className="profile-label">
                            Previous Password:
                            <input
                                className="profile-input"
                                type="password"
                                name="previous_password"
                                value={passwordData.previous_password}
                                onChange={handlePasswordChange}
                            />
                        </label>
                        <label className="profile-label">
                            New Password:
                            <input
                                className="profile-input"
                                type="password"
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                            />
                        </label>
                        <PasswordStrengthBar strength={passwordStrength} />
                        <label className="profile-label">
                            Confirm New Password:
                            <input
                                className="profile-input"
                                type="password"
                                name="confirm_new_password"
                                value={passwordData.confirm_new_password}
                                onChange={handlePasswordChange}
                            />
                        </label>
                    </div>
                    <div className="edit-profile-buttons">
                        <button type="submit" className="save-profile-button">
                            Save Profile
                        </button>
                        <button
                            type="button"
                            className="cancel-profile-button"
                            onClick={() => window.location.href = '/profile'}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="delete-profile-button"
                            onClick={() => setShowDeletePopup(true)}
                        >
                            Delete Profile
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;