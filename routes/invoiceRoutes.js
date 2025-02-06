const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const Invoice = require('../models/Invoice');
const InvoiceItem = require('../models/InvoiceItem');
const Client = require('../models/Client');
const UserProfile = require('../models/UserProfile');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, async(req, res) => {
    const transaction = await sequelize.transaction();
    try {
        console.log(req.body);
        const { client_id, creation_date, due_date, currency, fiscal_stamp, invoiceItems } = req.body;

        if (!client_id || !creation_date || !due_date || !currency || !(invoiceItems && invoiceItems.length)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const client = await Client.findByPk(client_id);
        const userProfile = await UserProfile.findOne({ where: { user_id: req.user.id } });

        if (!client || !userProfile) {
            return res.status(404).json({ error: 'Client or user profile not found' });
        }

        const invoice = await Invoice.create({
            company_id: client_id,
            user_id: req.user.id,
            creation_date,
            due_date,
            currency,
            fiscal_stamp: fiscal_stamp || false
        }, { transaction });

        const itemsWithInvoiceId = invoiceItems.map(item => ({
            name: item.name,
            price: item.price,
            type: item.type.toLowerCase(),
            quantity: item.quantity,
            taxes: item.taxes,
            invoice_id: invoice.id
        }));

        await InvoiceItem.bulkCreate(itemsWithInvoiceId, { transaction });

        const pdfBuffer = await generatePDF(userProfile, client, invoice, invoiceItems, currency);
        await Invoice.update({ file: pdfBuffer }, { where: { id: invoice.id }, transaction });

        await transaction.commit();
        res.status(201).json({ message: 'Invoice created successfully', body: {...req.body, id: invoice.id, invoice_id: invoice.invoice_id } });

    } catch (error) {
        await transaction.rollback();
        console.error('Invoice creation error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});



async function generatePDF(userProfile, client, invoice, invoiceItems, currency) {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 50, left: 50, right: 50, bottom: 50 } });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    // Header
    if (userProfile.picture) {
        doc.image(userProfile.picture, 50, 50, { width: 80 });
    }
    doc.fontSize(14).text(userProfile.company_name, 150, 50);
    doc.fontSize(10).text(userProfile.address, 150, 65);
    doc.text(`${userProfile.zip_code}, ${userProfile.country}`, 150, 80);
    doc.text(`Tel: ${userProfile.phone}  Email: ${userProfile.email || ''}`, 150, 95);

    doc.fontSize(20).text('INVOICE', 400, 50, { align: 'right' });

    doc.rect(400, 80, 140, 50).fill('#f2f2f2').stroke();
    doc.fillColor('#000').fontSize(10).text(`Invoice No: ${invoice.invoice_id}`, 410, 90);
    doc.text(`Date: ${invoice.creation_date}`, 410, 105);

    // Bill To & Ship To
    doc.moveDown(2);
    doc.fontSize(10).fillColor('#000').text('BILL TO:', 50, 150, { bold: true });
    doc.text(client.company_name, 50, 165);
    doc.text(client.address, 50, 180);
    doc.text(`${client.zip_code}, ${client.country}`, 50, 195);
    doc.text(`Tel: ${client.phone}  Email: ${client.email || ''}`, 50, 210);

    doc.fontSize(10).text('SHIP TO:', 300, 150, { bold: true });
    doc.text(client.company_name, 300, 165);
    doc.text(client.address, 300, 180);
    doc.text(`${client.zip_code}, ${client.country}`, 300, 195);
    doc.text(`Tel: ${client.phone}`, 300, 210);

    // Items Table Header
    let yPosition = 250;
    doc.rect(50, yPosition, 500, 20).fill('#FF6600').stroke();
    doc.fillColor('#fff').fontSize(10).text('DESCRIPTION', 55, yPosition + 5);
    doc.text('QTY', 280, yPosition + 5);
    doc.text('UNIT PRICE', 330, yPosition + 5);
    doc.text('TAX', 420, yPosition + 5);
    doc.text('TOTAL', 480, yPosition + 5);

    // Items Table Rows
    yPosition += 25;
    invoiceItems.forEach((item, index) => {
        if (index % 2 === 0) {
            doc.rect(50, yPosition, 500, 20).fill('#f2f2f2').stroke();
        }
        doc.fillColor('#000').text(item.name, 55, yPosition + 5);
        doc.text(item.quantity, 280, yPosition + 5);
        doc.text(`${item.price} ${currency}`, 330, yPosition + 5);
        doc.text(`${item.taxes || 0}%`, 420, yPosition + 5);
        doc.text(`${(item.price * item.quantity)} ${currency}`, 480, yPosition + 5);
        yPosition += 25;
    });

    // Summary Section
    let totalY = yPosition + 20;
    doc.rect(300, totalY, 250, 80).fill('#f2f2f2').stroke();
    doc.fillColor('#000').fontSize(10).text(`Subtotal: ${calculateTotalBeforeTax(invoiceItems)} ${currency}`, 310, totalY + 10);
    doc.text(`Total Tax: ${calculateTotalTax(invoiceItems)} ${currency}`, 310, totalY + 25);
    doc.text(`Grand Total: ${calculateTotalAfterTax(invoiceItems)} ${currency}`, 310, totalY + 40);

    // Balance Due
    doc.fillColor('#FF6600').fontSize(12).text('Balance Due:', 310, totalY + 60);
    doc.fillColor('#000').fontSize(12).text(`${calculateTotalAfterTax(invoiceItems)} ${currency}`, 430, totalY + 60);

    doc.end();
    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);
    });
}

function calculateTotalBeforeTax(invoiceItems) {
    return invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
}

function calculateTotalTax(invoiceItems) {
    return invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity * (item.taxes || 0) / 100), 0).toFixed(2);
}

function calculateTotalAfterTax(invoiceItems) {
    return (parseFloat(calculateTotalBeforeTax(invoiceItems)) + parseFloat(calculateTotalTax(invoiceItems))).toFixed(2);
}

// Get Invoice with invoiceItems
router.get('/:id', auth, async(req, res) => {
    try {
        const invoice = await Invoice.findOne({
            where: { id: req.params.id, user_id: req.user.id },
            include: [InvoiceItem]
        });

        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Invoices for the logged-in user
router.get('/', auth, async(req, res) => {
    try {
        const invoices = await Invoice.findAll({
            where: { user_id: req.user.id },
            include: [InvoiceItem]
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Invoice
router.put('/:id', auth, async(req, res) => {
    try {
        const [updated] = await Invoice.update(req.body, {
            where: { id: req.params.id, user_id: req.user.id },
        });

        await Promise.all(req.body.invoiceItems.map(async item => {
            await InvoiceItem.update(item, {
                where: { id: item.id, invoice_id: req.params.id },
            });
        }));

        const invoice = await Invoice.findOne({
            where: { id: req.params.id, user_id: req.user.id },
            include: [InvoiceItem]
        });
        const client = await Client.findByPk(invoice.company_id);
        const userProfile = await UserProfile.findOne({ where: { user_id: req.user.id } });
        const pdfBuffer = await generatePDF(userProfile, client, invoice, invoice.invoiceItems.map(item => item.dataValues), invoice.currency);

        await Invoice.update({ file: pdfBuffer }, { where: { id: invoice.id } });

        if (!updated) return res.status(404).json({ error: 'Invoice not found' });

        res.json({ message: 'Invoice updated successfully', invoice });
    } catch (error) {
        res.status(400).json({ error: error.message });
        console.log(error);
    }
});

//download
router.get('/download/:id', auth, async(req, res) => {
    try {
        const invoice = await Invoice.findOne({
            where: { id: req.params.id, user_id: req.user.id }
        });

        if (!invoice || !invoice.file) {
            return res.status(404).json({ error: 'Invoice PDF not found' });
        }

        // Set the response headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.invoice_id}.pdf`);

        // Send the file data as the response
        res.send(invoice.file); // Send the buffer directly
    } catch (error) {
        console.error('Error downloading invoice PDF:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Delete Invoice
router.delete('/:id', auth, async(req, res) => {
    try {
        const deleted = await Invoice.destroy({
            where: { id: req.params.id, user_id: req.user.id }
        });

        if (!deleted) return res.status(404).json({ error: 'Invoice not found' });

        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;