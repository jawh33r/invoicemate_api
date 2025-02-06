const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvoiceItem = sequelize.define('invoiceItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    type: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            isIn: [
                ['service', 'product']
            ]
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    taxes: { // Rename from 'taxes' to 'tax_rate'
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
            min: 0,
            max: 100
        }
    }
}, {
    tableName: 'invoiceitem',
    timestamps: false
});

module.exports = InvoiceItem;