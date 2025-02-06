const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('client', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company_name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fisical_code: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    zip_code: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    phone: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    email: {
        type: DataTypes.TEXT
    },
    country: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'userlogin',
            key: 'id'
        }
    }
}, {
    tableName: 'client',
    timestamps: false
});

module.exports = Client;