import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { generateToken, generateVerificationCode } from '../utils/helpers.js';

// Temporary Storage for Verification Codes (In-Memory - NOT for production)
const verificationCodes = {};

const register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const client = await pool.connect();
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        client.release();

        // Check if the username already exists (we'll do the final check after verification)
        const existingUser = await pool.query('SELECT * FROM secure_auth_api_users WHERE username = $1', [username]);

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Username already exists.' });
        }

        // Generate and store verification code temporarily
        const verificationCode = generateVerificationCode();
        verificationCodes[username] = { hashedPassword, code: verificationCode };

        // Simulate sending an email (in a real app, you'd use a library like Nodemailer)
        console.log(`Simulated email sent to ${username}: Your verification code is: ${verificationCode}`);

        res.status(200).json({ message: 'Registration initiated. Please check your email for the verification code.' });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const verify = async (req, res) => {
    const { username, code } = req.body;

    if (!username || !code) {
        return res.status(400).json({ error: 'Username and verification code are required.' });
    }

    const storedVerificationData = verificationCodes[username];

    if (storedVerificationData && storedVerificationData.code === code) {
        try {
            const client = await pool.connect();
            await client.query(
                'INSERT INTO secure_auth_api_users (username, password_hash) VALUES ($1, $2)',
                [username, storedVerificationData.hashedPassword]
            );
            client.release();

            delete verificationCodes[username]; // Remove from temporary storage

            res.status(200).json({ message: 'Account verified successfully. You can now log in.' });
        } catch (err) {
            console.error('Error during verification and user creation:', err);
            res.status(500).json({ error: 'Internal server error during verification.' });
        }
    } else {
        res.status(400).json({ error: 'Invalid username or verification code.' });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT id, username, password_hash FROM secure_auth_api_users WHERE username = $1', [username]);
        client.release();

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (passwordMatch) {
            const token = generateToken(user.id);
            res.status(200).json({ message: 'Login successful.', token: token });
        } else {
            res.status(401).json({ error: 'Invalid credentials.' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const getMe = async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT id, username FROM secure_auth_api_users WHERE id = $1', [req.userId]);
        client.release();

        if (result.rows.length === 1) {
            res.status(200).json({ user: result.rows[0] });
        } else {
            res.status(404).json({ error: 'User not found.' }); // Should ideally not happen if JWT is valid
        }
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Old password and new password are required.' });
    }

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT password_hash FROM secure_auth_api_users WHERE id = $1', [req.userId]);

        if (result.rows.length === 1) {
            const user = result.rows[0];
            const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);

            if (passwordMatch) {
                const saltRounds = 10;
                const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
                await client.query('UPDATE secure_auth_api_users SET password_hash = $1 WHERE id = $2', [newHashedPassword, req.userId]);
                client.release();
                res.status(200).json({ message: 'Password updated successfully.' });
            } else {
                client.release();
                res.status(401).json({ error: 'Incorrect old password.' });
            }
        } else {
            client.release();
            res.status(404).json({ error: 'User not found.' }); // Should ideally not happen
        }
    } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const deleteMe = async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password is required to delete your account.' });
    }

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT password_hash FROM secure_auth_api_users WHERE id = $1', [req.userId]);

        if (result.rows.length === 1) {
            const user = result.rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password_hash);

            if (passwordMatch) {
                await client.query('DELETE FROM secure_auth_api_users WHERE id = $1', [req.userId]);
                client.release();
                res.status(200).json({ message: 'Account deleted successfully.' });
            } else {
                client.release();
                res.status(401).json({ error: 'Incorrect password.' });
            }
        } else {
            client.release();
            res.status(404).json({ error: 'User not found.' }); // Should ideally not happen
        }
    } catch (err) {
        console.error('Error deleting account:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export { register, verify, login, getMe, updatePassword, deleteMe };