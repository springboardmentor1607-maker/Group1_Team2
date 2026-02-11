const { pool } = require('../config/db');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password, location, role } = req.body;

        // Check existing user
        const existing = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const result = await pool.query(
            `INSERT INTO users (name,email,password,location,role)
             VALUES ($1,$2,$3,$4,$5)
             RETURNING id, role`,
            [name, email, hashedPassword, location || '', role || 'citizen']
        );

        const user = result.rows[0];

        // Create JWT
        const token = jwt.sign(
            { user: { id: user.id, role: user.role } },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '1h' }
        );

        res.status(201).json({ token, message: 'User registered successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { user: { id: user.id, role: user.role } },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

