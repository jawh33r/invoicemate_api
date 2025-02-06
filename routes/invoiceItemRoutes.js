const express = require('express');
const router = express.Router();
const InvoiceItem = require('../models/InvoiceItem');
const Invoice = require('../models/Invoice');
const auth = require('../middleware/authMiddleware');

// Create Invoice Item
router.post('/', auth, async(req, res) => {
    try {
        const invoice = await Invoice.findOne({
            where: {
                id: req.body.invoice_id,
                user_id: req.user.id
            }
        });

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const item = await InvoiceItem.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get All Invoice Items for the logged-in user
router.get('/', auth, async(req, res) => {
    try {
        const items = await InvoiceItem.findAll({
            include: [{
                model: Invoice,
                where: {
                    user_id: req.user.id
                }
            }]
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Invoice Item
router.put('/:id', auth, async(req, res) => {
    const { id } = req.params;

    try {
        const item = await InvoiceItem.findByPk(id, {
            include: [{
                model: Invoice,
                where: {
                    user_id: req.user.id
                }
            }]
        });

        if (!item) {
            return res.status(404).json({ error: 'Invoice item not found' });
        }

        await item.update(req.body);
        res.json({ message: 'Invoice item updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete Invoice Item
router.delete('/:id', auth, async(req, res) => {
    const { id } = req.params;

    try {
        const item = await InvoiceItem.findByPk(id, {
            include: [{
                model: Invoice,
                where: {
                    user_id: req.user.id
                }
            }]
        });

        if (!item) {
            return res.status(404).json({ error: 'Invoice item not found' });
        }

        await item.destroy();
        res.json({ message: 'Invoice item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;