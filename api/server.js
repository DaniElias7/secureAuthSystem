import express from 'express';
import dotenv from 'dotenv';
import authenticateToken from './middleware/authMiddleware.js';
import * as authController from './controllers/authController.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API Endpoints
app.post('/register', authController.register);
app.post('/verify', authController.verify);
app.post('/login', authController.login);
app.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'This is a protected route.', userId: req.userId });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});