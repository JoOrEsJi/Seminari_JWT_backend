import { Request, Response } from "express";
import { registerNewUser, loginUser, googleAuth } from "../auth/auth_service.js";
import { verifyRefreshToken, generateToken, generateRefreshToken } from "../../utils/jwt.handle.js";
import User from "../users/user_models.js";

const registerCtrl = async ({ body }: Request, res: Response) => {
    try {
        const responseUser = await registerNewUser(body);
        res.json(responseUser);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const loginCtrl = async ({ body }: Request, res: Response) => {
    try {
        const { name, email, password } = body;
        const responseUser = await loginUser({ name, email, password });

        if (responseUser === 'INCORRECT_PASSWORD') {
            return res.status(403).json({ message: 'Contraseña incorrecta' });
        }

        if (responseUser === 'NOT_FOUND_USER') {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.json(responseUser);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

const googleAuthCtrl = async (req: Request, res: Response) => {
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URL;
    if (!redirectUri) {
        console.error(" ERROR: GOOGLE_OAUTH_REDIRECT_URL no està definida a .env");
        return res.status(500).json({ message: "Error interno de configuración" });
    }
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = new URLSearchParams({
        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL!,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
    });
    const fullUrl = `${rootUrl}?${options.toString()}`;
    res.redirect(fullUrl);
};

const googleAuthCallback = async (req: Request, res: Response) => {
    try {
        const code = req.query.code as string;
        if (!code) {
            return res.status(400).json({ message: 'Código de autorización faltante' });
        }
        const authData = await googleAuth(code);
        if (!authData) {
            return res.redirect('/login?error=authentication_failed');
        }
        res.cookie('token', authData.token, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: 86400000
        });
        res.redirect(`http://localhost:4200/?token=${authData.token}`);
    } catch (error: any) {
        res.redirect('/login?error=server_error');
    }
};

const refreshCtrl = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: "Falta el refreshToken" });

        const decoded: any = verifyRefreshToken(refreshToken);
        const user = await User.findOne({ _id: decoded.id });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        if (user.refreshToken !== refreshToken) return res.status(403).json({ message: "Refresh Token no válido" });

        const newAccessToken = generateToken(JSON.stringify({ id: user._id, email: user.email, role: "estudiante" }));
        return res.json({ accessToken: newAccessToken });
    } catch (error: any) {
        return res.status(401).json({ message: "Refresh Token expirado o inválido" });
    }
};

export { registerCtrl, loginCtrl, googleAuthCtrl, googleAuthCallback, refreshCtrl };
