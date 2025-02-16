const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const dotenv = require('dotenv');
const pino = require('pino');
const authRoutes = require('./routes/authRoutes'); 

dotenv.config();
const app = express();
const router = express.Router();
const logger = pino();

const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use('/api/auth', authRoutes);

router.post('/register', async (req, res) => {
    try {
        const db = await connectToDatabase();

        const collection = db.collection("users");

        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);

        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };
        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User registered successfully');
        res.json({ authtoken, email: req.body.email });
    } catch (e) {
        logger.error('Error registering user:', e);
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;
