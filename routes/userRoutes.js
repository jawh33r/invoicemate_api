const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserLogin = require('../models/UserLogin');
const UserProfile = require('../models/UserProfile');
const auth = require('../middleware/authMiddleware');

// Register User (Basic Account)
router.post('/register', async(req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const existingUser = await UserLogin.findOne({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await UserLogin.create({
            username,
            password: hashedPassword
        });

        const token = jwt.sign({ userId: user.id },
            process.env.JWT_SECRET, { expiresIn: process.env.EXPIN }
        );

        res.status(201).json({
            message: 'Registration successful. Please complete your profile.',
            token,
            user: {
                id: user.id,
                username: user.username,
                profileSetupRequired: true
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login User
router.post('/login', async(req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await UserLogin.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id },
            process.env.JWT_SECRET, { expiresIn: process.env.EXPIN }
        );

        const profileExists = await UserProfile.findOne({ where: { user_id: user.id } });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                profileSetupRequired: !profileExists
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// In your users.js routes
router.post('/profile', auth, async(req, res) => {
    try {
        // Get user ID from middleware
        const userId = req.user.id;

        // Validate required fields - Add explicit check
        const requiredFields = {
            company_name: 'Company name',
            fisical_code: 'Fiscal code',
            address: 'Address',
            zip_code: 'Zip code',
            country: 'Country',
            phone: 'Phone',
            local_currency: 'Currency',
            local_tax_percentage: 'Tax rate'
        };

        const missing = Object.entries(requiredFields)
            .filter(([key]) => !req.body[key])
            .map(([_, name]) => name);

        if (missing.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                missing
            });
        }

        // Create profile with explicit field mapping
        const profile = await UserProfile.create({
            user_id: userId,
            company_name: req.body.company_name,
            fisical_code: req.body.fisical_code,
            address: req.body.address,
            zip_code: req.body.zip_code,
            country: req.body.country,
            phone: req.body.phone,
            email: req.body.email || null,
            local_currency: req.body.local_currency,
            local_tax_percentage: parseFloat(req.body.local_tax_percentage),
            picture: req.body.picture ? Buffer.from(req.body.picture, 'base64') : null
        });

        res.status(201).json({
            success: true,
            profile: {
                id: profile.id,
                company_name: profile.company_name,
                fisical_code: profile.fisical_code
            }
        });

    } catch (error) {
        console.error('Profile Error:', error);
        res.status(500).json({
            error: 'Profile creation failed',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
});

router.patch('/profile', auth, async(req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        if (updates.picture) {
            console.log(updates.picture)
            updates.picture = Buffer.from(updates.picture, 'base64');
        }

        const [affectedRows] = await UserProfile.update(updates, {
            where: { user_id: userId }
        });

        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const updatedProfile = await UserProfile.findOne({ where: { user_id: userId } });
        res.json({
            message: 'Profile updated successfully',
            profile: sanitizeProfile(updatedProfile)
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/profile', auth, async(req, res) => {
    try {
        const profile = await UserProfile.findOne({
            where: { user_id: req.user.id }
        });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(sanitizeProfile(profile));

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update Profile Picture
router.patch('/profile/picture', auth, async(req, res) => {
    try {
        const userId = req.user.id;
        const { picture } = req.body;

        if (!picture) {
            return res.status(400).json({ error: 'No picture provided' });
        }

        // Convert picture from base64 to Buffer
        const pictureBuffer = Buffer.from(picture, 'base64');

        // Update profile picture
        const [affectedRows] = await UserProfile.update({ picture: pictureBuffer }, { where: { user_id: userId } });

        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const updatedProfile = await UserProfile.findOne({ where: { user_id: userId } });

        res.json({
            message: 'Profile picture updated successfully',
            profile: sanitizeProfile(updatedProfile)
        });

    } catch (error) {
        console.error('Profile picture update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete Profile Picture
router.delete('/profile/picture', auth, async(req, res) => {
    try {
        const userId = req.user.id;

        // Update profile picture to NULL (deleting it)
        const [affectedRows] = await UserProfile.update({ picture: null }, { where: { user_id: userId } });

        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const updatedProfile = await UserProfile.findOne({ where: { user_id: userId } });

        res.json({
            message: 'Profile picture deleted successfully',
            profile: sanitizeProfile(updatedProfile)
        });

    } catch (error) {
        console.error('Profile picture delete error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change Password
router.post('/change-password', auth, async(req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: 'Current password, new password, and confirm password are required' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'New password and confirm password do not match' });
        }

        // Fetch the user
        const user = await UserLogin.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        await UserLogin.update({ password: hashedPassword }, { where: { id: userId } });

        res.status(200).json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


function sanitizeProfile(profile) {
    const profileData = profile.toJSON();
    if (profileData.picture) {
        profileData.picture = profileData.picture.toString('base64');
    }
    return profileData;
}

module.exports = router;