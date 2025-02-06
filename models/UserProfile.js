const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const UserLogin = require('./UserLogin');

const UserProfile = sequelize.define('userprofile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: UserLogin,
            key: 'id'
        }
    },
    picture: {
        type: DataTypes.BLOB
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
    country: {
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
    local_currency: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    local_tax_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    }
}, {
    tableName: 'userprofile',
    timestamps: false
});

module.exports = UserProfile;