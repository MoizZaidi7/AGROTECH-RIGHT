// utils/otpGenerator.js
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generates a random 6-digit OTP
};
export {generateOTP}
