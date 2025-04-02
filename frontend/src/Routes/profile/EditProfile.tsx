import React, { useEffect, useState, useRef } from 'react';
import './EditProfile.scss';
import PasswordStrengthBar, { calculatePasswordStrength } from '../../Components/PasswordStrengthBar/PasswordStrengthBar';

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

const EditProfile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        email_private: false,
        bio: '',
        profile_picture: '',
        profile_picture_public_id: '',
        created_at: '',
        updated_at: '',
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
        const fetchProfile = async () => {
            try {
                const userId = localStorage.getItem('user_id');
                const response = await fetch(`/api/auth/profile/id:${userId}`, {
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
                setPreviewImage(data.profile_picture);
                setLoading(false);
            } catch (error) {
                setError('Error fetching profile. Please try again.');
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

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
        setPasswordError('');

        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profile.email)) {
            setError('Invalid email format');
            setLoading(false);
            return;
        }

        // Check for password errors first
        if (passwordData.previous_password || passwordData.new_password || passwordData.confirm_new_password) {
            if (!passwordData.previous_password || !passwordData.new_password || !passwordData.confirm_new_password) {
                setPasswordError('All password fields must be filled out');
                return;
            }

            if (passwordData.new_password !== passwordData.confirm_new_password) {
                setPasswordError('New passwords do not match');
                return;
            }

            // Validate new password
            const password = passwordData.new_password;
            const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
            const numberRegex = /[0-9]/;
            const letterRegex = /[a-zA-Z]/;
            const uppercaseRegex = /[A-Z]/;
            const lowercaseRegex = /[a-z]/;

            if (password.length < 8) {
                setPasswordError('Password must be at least 8 characters long');
                return;
            }

            if (!specialCharacterRegex.test(password)) {
                setPasswordError('Password must contain at least 1 special character');
                return;
            }

            if (!numberRegex.test(password) || !letterRegex.test(password)) {
                setPasswordError('Password must contain both numbers and letters');
                return;
            }

            if (!uppercaseRegex.test(password) || !lowercaseRegex.test(password)) {
                setPasswordError('Password must contain both uppercase and lowercase letters');
                return;
            }
        }

        try {
            // First, update the profile information
            const userId = localStorage.getItem('user_id');
            const response = await fetch(`/api/auth/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profile),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            // Then, handle password change if all password fields are filled
            if (passwordData.previous_password && passwordData.new_password && passwordData.confirm_new_password) {
                const passwordResponse = await fetch(`/api/auth/change-password/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        current_password: passwordData.previous_password,
                        new_password: passwordData.new_password
                    }),
                });

                if (!passwordResponse.ok) {
                    const errorText = await passwordResponse.text();
                    try {
                        const errorData = JSON.parse(errorText);
                        if (passwordResponse.status === 401) {
                            setPasswordError(errorData.message || 'Current password is incorrect');
                        } else {
                            throw new Error(errorData.message || 'Failed to change password');
                        }
                    } catch {
                        throw new Error('Failed to parse error response');
                    }
                    return;
                }
            }

            // Redirect to profile page on success
            window.location.href = '/profile';
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('password')) {
                    setPasswordError(error.message);
                } else {
                    setError('Error updating profile. Please try again.');
                }
            } else {
                setError('An unexpected error occurred.');
            }
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
            const userId = localStorage.getItem('user_id');
            const response = await fetch(`/api/auth/profile/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    password: deletePasswordData.password
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete profile');
            }

            // Clear local storage and redirect to home page
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');
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
                            Name:
                            <input
                                className="profile-input"
                                type="text"
                                name="name"
                                value={profile.name}
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