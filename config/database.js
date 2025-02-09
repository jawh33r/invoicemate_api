const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize("postgresql://neondb_owner:npg_l7qvm4TVUyXW@ep-jolly-lab-a8s5fydw-pooler.eastus2.azure.neon.tech/invoicematedb", {
    dialect: 'postgres',
    logging: false,
});

module.exports = sequelize;