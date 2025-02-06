const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const auth = require('../middleware/authMiddleware'); // Import the middleware

// Create Client (Protected Route)
router.post('/', auth, async(req, res) => {
    try {
        // Debugging: Log received data
        console.log('Received client data:', req.body);
        const client = await Client.create({
            ...req.body,
            user_id: req.user.id // Associate the client with the logged-in user
        });
        res.status(201).json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get All Clients for the Logged-in User (Protected Route)
router.get('/', auth, async(req, res) => {
    try {
        const clients = await Client.findAll({
            where: { user_id: req.user.id }
        });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Client (Protected Route)
router.put('/:id', auth, async(req, res) => {
    const { id } = req.params;

    try {
        const [updated] = await Client.update(req.body, {
            where: {
                id,
                user_id: req.user.id // Ensure the client belongs to the logged-in user
            }
        });
        const client = await Client.findOne({
            where: {
                id,
                user_id: req.user.id
            }
        });

        if (updated) {
            res.json({ message: 'Client updated successfully', client });
        } else {
            res.status(404).json({ error: 'Client not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Client (Protected Route)
router.delete('/:id', auth, async(req, res) => {
    const { id } = req.params;

    try {
        const deleted = await Client.destroy({
            where: {
                id,
                user_id: req.user.id // Ensure the client belongs to the logged-in user
            }
        });

        if (deleted) {
            res.json({ message: 'Client deleted successfully' });
        } else {
            res.status(404).json({ error: 'Client not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;