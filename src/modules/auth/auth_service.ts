import { encrypt, verified } from "../../utils/bcrypt.handle.js";
import { generateToken, generateRefreshToken } from "../../utils/jwt.handle.js";
import User from "../users/user_models.js";
import { Auth } from "./auth_model.js";
import jwt from 'jsonwebtoken';
import axios from 'axios';

const GOOGLE_CLIENT_ID = "tu-client-id";
const GOOGLE_CLIENT_SECRET = "tu-client-secret";
const GOOGLE_OAUTH_REDIRECT_URL = "http://localhost:9000/api/auth/google/callback";

const registerNewUser = async ({ email, password, name, age }: any) => {
    const checkIs = await User.findOne({ email });
    if (checkIs) return "ALREADY_USER";

    const passHash = await encrypt(password);
    const newUser = await User.create({
        email,
        password: passHash,
        name,
        age
    });
    return newUser;
};

const loginUser = async ({ email, password }: Auth) => {
    const checkIs = await User.findOne({ email });
    if (!checkIs) return "NOT_FOUND_USER";

    const passwordHash = checkIs.password;
    const isCorrect = await verified(password, passwordHash);
    if (!isCorrect) return "INCORRECT_PASSWORD";

    const accessToken = generateToken({
        id: checkIs._id,
        email: checkIs.email,
        role: "estudiante"
    });

    const refreshToken = generateRefreshToken({
        id: checkIs._id,
        email: checkIs.email
    });

    checkIs.refreshToken = refreshToken;
    await checkIs.save();

    const data = {
        accessToken,
        refreshToken,
        user: {
            id: checkIs._id,
            name: checkIs.name,
            email: checkIs.email,
            age: checkIs.age
        }
    };
    return data;
};

const googleAuth = async (code: string) => {
    try {
        interface TokenResponse {
            access_token: string;
            expires_in: number;
            scope: string;
            token_type: string;
            id_token?: string;
        }

        const tokenResponse = await axios.post<TokenResponse>('https://oauth2.googleapis.com/token', {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_OAUTH_REDIRECT_URL,
            grant_type: 'authorization_code'
        });

        const access_token = tokenResponse.data.access_token;

        const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
            params: { access_token },
            headers: { Accept: 'application/json' },
        });

        const profile = profileResponse.data as { name: string, email: string; id: string };

        let user = await User.findOne({
            $or: [{ name: profile.name }, { email: profile.email }, { googleId: profile.id }]
        });

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-8);
            const passHash = await encrypt(randomPassword);
            user = await User.create({
                name: profile.name,
                email: profile.email,
                googleId: profile.id,
                password: passHash,
            });
        }

        const token = generateToken({ id: user._id, email: user.email });
        return { token, user };

    } catch (error: any) {
        throw new Error('Error en autenticación con Google');
    }
};

export { registerNewUser, loginUser, googleAuth };
