import jwt from 'jsonwebtoken';

const generateToken = (userId, userType, expiresIn = '1h') => {
    return jwt.sign({ id: userId , role: userType}, process.env.JWT_SECRET, { expiresIn });
};

export default generateToken;
