import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
};

const generateVerificationCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase(); // Simple random string
};

export { generateToken, generateVerificationCode };