export const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!password) {
        return { isValid: false, message: 'Password is required.' };
    }

    if (!passwordRegex.test(password)) {
        return {
            isValid: false,
            message: 'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one digit, and one special character.',
        };
    }

    return { isValid: true, message: 'Password is valid.' };
};
