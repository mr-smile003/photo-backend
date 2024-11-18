import express from 'express';
import photoRoutes from './routes/photoRoutes.js';
import connectToDatabase from './config/database.js';
import cors from 'cors';
import eventRoutes from './routes/eventRoutes.js';
import userRoutes from './routes/userRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import { authenticateAPIKey } from './middleware/authenticateAPIKey.js';
import dotenv from 'dotenv';
import mainCategoryRoutes from './routes/mainCategoryRoutes.js';
const app = express();

// Connect to MongoDB
dotenv.config();
connectToDatabase();
// Apply CORS middleware first
app.use(cors({
    origin: '*', // Frontend's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods if needed
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'], // Headers you want to allow
    credentials: true // If you need credentials like cookies
}));

// Parse request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (req, res) => {
    res.send('Server is Up');
});
app.use(authenticateAPIKey);
// Register routes after CORS
app.use('/api/photos', photoRoutes);
app.use('/events', eventRoutes);
app.use('/folders', folderRoutes);
app.use('/users', userRoutes)
app.use('/main-category', mainCategoryRoutes)
// Serve static files
app.use(express.static('public'));

export default app;
