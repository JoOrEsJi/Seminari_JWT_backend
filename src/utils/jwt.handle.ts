import pkg from "jsonwebtoken";
const { sign, verify } = pkg;   //Importamos las funciones sign y verify de la librería jsonwebtoken
const JWT_SECRET = process.env.JWT_SECRET || "token.010101010101";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh.010101010101";

//No debemos pasar información sensible en el payload, en este caso vamos a pasar como parametro el ID del usuario
const generateToken = (id:string) => {
    const jwt = sign({id}, JWT_SECRET, {expiresIn: '20s'});
    return jwt;
};

const generateRefreshToken = (payload: any) => {
    const jwt = sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" }); 
    return jwt;
};

const verifyToken = (jwt: string) => {
    const isOk = verify(jwt, JWT_SECRET);
    return isOk;

};

const verifyRefreshToken = (token: string) => {
    return verify(token, JWT_REFRESH_SECRET);
};

export { generateToken, verifyToken, generateRefreshToken, verifyRefreshToken };