const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};


// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password, location, role } = req.body;

        const existing = await User.findByEmail(email);

        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Creating user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            location,
            role
        });

        //JWT
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

        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { user: { id: user.id, role: user.role } },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, location: user.location || '', phone: user.phone || '', createdAt: user.created_at } });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// GET PROFILE
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                location: user.location,
                phone: user.phone,
                createdAt: user.created_at
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, location } = req.body;
        const userId = req.user.id;
        
        // Check if email is being changed and if it already exists
        if (email) {
            const existingUser = await User.findByEmail(email);
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }
        
        const updatedUser = await User.updateProfile(userId, {
            name,
            email,
            phone: phone || '',
            location: location || ''
        });
        
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                location: updatedUser.location,
                phone: updatedUser.phone,
                createdAt: updatedUser.created_at
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Middleware export
exports.verifyToken = verifyToken;

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        const users = await User.findAll();
        
        // Remove password from response
        const safeUsers = users.map(user => {
            const { password, ...safeUser } = user;
            return safeUser;
        });

        res.json({
            success: true,
            users: safeUsers
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ 
            message: 'Server error while fetching users' 
        });
    }
};

// Admin: Update user role
exports.updateUserRole = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        const { user_id, role } = req.body;

        if (!user_id || !role) {
            return res.status(400).json({ 
                message: 'User ID and role are required' 
            });
        }

        // Validate role
        const validRoles = ['citizen', 'volunteer', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                message: 'Invalid role. Must be: citizen, volunteer, or admin' 
            });
        }

        const updatedUser = await User.updateRole(user_id, role);
        
        if (!updatedUser) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        // Remove password from response
        const { password, ...safeUser } = updatedUser;

        res.json({
            success: true,
            message: 'User role updated successfully',
            user: safeUser
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ 
            message: 'Server error while updating user role' 
        });
    }
};

