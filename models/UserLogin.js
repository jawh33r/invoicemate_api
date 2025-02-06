const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Invoice = require('./Invoice');
const Client = require('./Client');

const UserLogin = sequelize.define('userlogin', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'userlogin',
    timestamps: false
});

UserLogin.hasMany(Client, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});
UserLogin.hasMany(Invoice, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

module.exports = UserLogin;