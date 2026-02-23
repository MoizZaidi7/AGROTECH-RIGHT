import crypto from 'crypto';

export const hashOTP = (otp) => {
    if (!otp) throw new Error('OTP is required to hash');
    return crypto.createHash('sha256').update(otp.toString()).digest('hex');
};
