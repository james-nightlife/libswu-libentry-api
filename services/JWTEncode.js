import jwt from 'jsonwebtoken'; 

export const JWTEncode = (payload) => {
    const SECRET = process.env.JWT_SECRET;
    const token = jwt.sign(payload, SECRET, { expiresIn: '3h' });
    return token;
}