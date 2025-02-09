const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Client = require('./Client');
const InvoiceItem = require('./InvoiceItem');

const Invoice = sequelize.define('invoice', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    invoice_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        unique: true,
        autoIncrement: true,
    },
    company_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Client,
            key: 'id'
        }
    },
    file: {
        type: DataTypes.BLOB
    },
    creation_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
        validate: {
            isIn: [
                ['USD', 'EUR', 'GBP', 'TND']
            ]
        }
    },
    fiscal_stamp: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'invoice',
    timestamps: false
});
// Add association
Invoice.hasMany(InvoiceItem, {
    foreignKey: 'invoice_id',
    onDelete: 'CASCADE'
});

module.exports = Invoice;