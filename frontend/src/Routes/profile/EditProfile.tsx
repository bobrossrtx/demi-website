import React, { useEffect, useState, useRef } from 'react';
import './EditProfile.scss';

interface UserProfile {
    name: string;
    email: string;
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
        bio: '',
        profile_picture: '',
        profile_picture_public_id: '',
        created_at: '',
        updated_at: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
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

            window.location.href = '/profile';
        } catch (error) {
            setError('Error updating profile. Please try again.');
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
            if (profile.profile_picture_public_id) {
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
                <div className="profile-details">
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
                    <label className="profile-label">
                        Bio:
                        <textarea
                            className="profile-textarea"
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                        />
                    </label>
                    <button type="submit" className="save-profile-button">
                        Save Profile
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;