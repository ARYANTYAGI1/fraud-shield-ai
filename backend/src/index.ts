import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db';
import logger from './config/logger';
import apiRouter from './routes';
import { errorHandler } from './middlewares/errorMiddleware';
import { generalLimiter } from './middlewares/limitMiddleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // In production, replace with specific domain URL (e.g. localhost:3000)
  credentials: true,
}));

// Rate Limiter
app.use(generalLimiter);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware
const morganFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat, {
  stream: { write: (message) => logger.http(message.trim()) }
}));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Mounting combined router
app.use('/api', apiRouter);

// Error Handling Middleware
app.use(errorHandler);

// Connect to Database and start Server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start the Express server:', error);
    process.exit(1);
  }
};

startServer();
