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
import { ChatServer } from './init/chat.js';
import { runMigrations } from './helpers/migrate.js';
import { logger } from './helpers/logger.js'
await runMigrations();

const __filename = fileURLToPath(import.meta.url);
const _dirname = dirname(__filename);
dotenv.config({path: join(_dirname, '../.env')})


const swaggerDocument = YAML.load(join(_dirname, 'docs/swagger.yaml'));

const app = express();

if (process.env.ENV !== 'prod') {
    logger.info(`API docs exposed at /api-docs`)
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}


// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Error handling
app.use((err, req, res, next) => {
    logger.debug(err.stack);
    res.status(500).json({message: 'Something broke!'});
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT,'0.0.0.0', () => {
    logger.info(`Server is running on port ${PORT}`);
});
const chatServer = new ChatServer(server);