import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './modules/users/user_routes.js';
import forumRoutes from './modules/forum/forum_routes.js';
import subjectRoutes from './modules/subjects/subject_routes.js';
import authRoutes from './modules/auth/auth_routes.js';
import { corsHandler } from './middleware/corsHandler.js';
import { loggingHandler } from './middleware/loggingHandler.js';
import { routeNotFound } from './middleware/routeNotFound.js';
import { checkJwt } from './middleware/session.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

dotenv.config();

const app = express();
const LOCAL_PORT = process.env.SERVER_PORT || 9000;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Usuarios',
            version: '1.0.0',
            description: 'Documentación de la API de Usuarios'
        },
        tags: [
            { name: 'Users', description: 'Rutas relacionadas con la gestión de usuarios' },
            { name: 'Forum', description: 'Rutas relacionadas con el forum' },
            { name: 'Subjects', description: 'Rutas relacionadas con las asignaturas' },
            { name: 'Auth', description: 'Rutas relacionadas con la autenticación' },
            { name: 'Main', description: 'Rutas principales de la API' }
        ],
        servers: [
            { url: `http://localhost:${LOCAL_PORT}` }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            { bearerAuth: [] }
        ]
    },
    apis: [
        './build/modules/users/*.js',
        './build/modules/forum/*.js',
        './build/modules/subjects/*.js',
        './build/modules/auth/*.js'
    ]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use(loggingHandler);
app.use(corsHandler);

app.use('/api', userRoutes);
app.use('/api', forumRoutes);
app.use('/api', subjectRoutes);
app.use('/api', authRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to my API');
});

mongoose
    .connect(process.env.MONGODB_URI || 'mongodb+srv://joan:1234@cluster0.3owhs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connected to DB'))
    .catch((error) => console.error('DB Connection Error:', error));

app.listen(LOCAL_PORT, () => {
    console.log('Server listening on port: ' + LOCAL_PORT);
    console.log(`Swagger disponible a http://localhost:${LOCAL_PORT}/api-docs`);
});

function cors(arg0: { origin: string; credentials: boolean; }): any {
    throw new Error('Function not implemented.');
}
