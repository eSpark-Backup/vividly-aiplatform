import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import {dirname, join} from 'path'
import {fileURLToPath} from 'url';
import express from 'express';
import cors from 'cors';
import './init/passport.js';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import speechRoutes from './routes/speech.js';
import subscriptionRoutes from './routes/subscription.js';
import { ChatServer } from './init/chat.js';
import { runMigrations } from './helpers/migrate.js';
import { logger } from './helpers/logger.js'
import * as http from "node:http";
await runMigrations();

const __filename = fileURLToPath(import.meta.url);
const _dirname = dirname(__filename);
dotenv.config({path: join(_dirname, '../.env')})


const swaggerDocument = YAML.load(join(_dirname, 'docs/swagger.yaml'));

const app = express();
const server = http.createServer(app)

if (process.env.ENV !== 'prod') {
    logger.info(`API docs exposed at /api-docs`)
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}


// Middleware
// app.use(cors({
//     origin: function (origin, callback) {
//         if (!origin) return callback(null, true);

//         const vividlyRegex = /^https:\/\/([a-zA-Z0-9-]+\.)?vividlyai\.ai$/;
//         const esparkRegex = /^https:\/\/([a-zA-Z0-9-]+\.)?esparkconsultants\.com$/;

//         if (vividlyRegex.test(origin) || esparkRegex.test(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// }));
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/speech', speechRoutes);
app.use('/subscription', subscriptionRoutes);


new ChatServer(server);

// Error handling
app.use((err, req, res, next) => {
    logger.debug(err.stack);
    res.status(500).json({message: 'Something broke!'});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket endpoints available at:`);
    console.log(`- Chat: ws://localhost:${PORT}/chat`);
});