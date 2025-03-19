import React from 'react';

const PasswordStrengthBar: React.FC<{ strength: number }> = ({ strength }) => {
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColors = ['#ff4d4d', '#ff944d', '#ffd24d', '#94ff4d', '#4dff4d'];

    return (
        <div className="password-strength-bar">
            <div
                className="password-strength-indicator"
                style={{
                    width: `${(strength / 5) * 100}%`,
                    backgroundColor: strengthColors[strength - 1],
                }}
            />
            <div className="password-strength-label">
                {strengthLabels[strength - 1]}
            </div>
        </div>
    );
};

export const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const numberRegex = /[0-9]/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;

    if (specialCharacterRegex.test(password)) strength += 1;
    if (numberRegex.test(password)) strength += 1;
    if (uppercaseRegex.test(password)) strength += 1;
    if (lowercaseRegex.test(password)) strength += 1;
    if (password.length >= 10) strength += 1;

    return strength;
};

export default PasswordStrengthBar;