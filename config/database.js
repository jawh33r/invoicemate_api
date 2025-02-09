const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.BD_CONNECT, {
    dialect: 'postgres',
    logging: false,
});

module.exports = sequelize;