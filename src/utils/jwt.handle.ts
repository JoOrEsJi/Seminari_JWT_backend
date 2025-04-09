import pkg from "jsonwebtoken";
const { sign, verify } = pkg;

const JWT_SECRET = "token.010101010101";
const JWT_REFRESH_SECRET = "refresh.010101010101";

const generateToken = (payload: any) => {
    return sign(payload, JWT_SECRET, { expiresIn: "20s" });
};

const generateRefreshToken = (payload: any) => {
    return sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

const verifyToken = (token: string) => {
    return verify(token, JWT_SECRET);
};

const verifyRefreshToken = (token: string) => {
    return verify(token, JWT_REFRESH_SECRET);
};

export { 
    generateToken, 
    generateRefreshToken, 
    verifyToken, 
    verifyRefreshToken 
};
