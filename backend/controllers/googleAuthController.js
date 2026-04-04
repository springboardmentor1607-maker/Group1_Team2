const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Use environment variable or a default (client should provide this)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    try {
        const { token, role } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'No Google token provided' });
        }

        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user already exists with this Google account
        let user = await User.findByGoogleId(googleId);

        if (user) {
            // User exists, check if we need to update the role (e.g. they selected a role during Google login)
            if (role && role !== user.role) {
                user = await User.updateRole(user.id, role);
            }
        } else {
            // User doesn't exist by Google ID, check if they exist by email
            user = await User.findByEmail(email);

            if (user) {
                // Link Google authentication to existing account
                user = await User.linkGoogleAccount(user.id, googleId, picture);
                
                // If a specific role was requested (from signup), update it
                if (role && role !== user.role) {
                    user = await User.updateRole(user.id, role);
                }
            } else {
                // Create new user for Google login
                user = await User.create({
                    name: name || 'Google User',
                    email,
                    google_id: googleId,
                    profile_photo: picture,
                    role: role || 'citizen' // Use provided role if available
                });
            }
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            { user: { id: user.id, role: user.role } },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '24h' } // Longer session for OAuth
        );

        res.json({
            success: true,
            token: jwtToken,
            message: 'Google login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                location: user.location || '',
                state: user.state || '',
                phone: user.phone || '',
                profile_photo: user.profile_photo || picture,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Invalid Google token or verification failed',
            error: error.message 
        });
    }
};
