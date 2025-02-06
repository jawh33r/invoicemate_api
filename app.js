const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');

const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const invoiceItemRoutes = require('./routes/invoiceItemRoutes');

const app = express();
const PORT = process.env.PORT || 5051;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));


app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);

// Logging utility functions
const logger = {
    info: (message) => console.log(`[${new Date().toISOString()}] ℹ️  INFO: ${message}`),
    success: (message) => console.log(`[${new Date().toISOString()}] ✅ SUCCESS: ${message}`),
    warn: (message) => console.log(`[${new Date().toISOString()}] ⚠️  WARN: ${message}`),
    error: (message, error) => {
        console.error(`[${new Date().toISOString()}] ❌ ERROR: ${message}`);
        if (error) console.error(error.stack);
    },
    banner: () => {
        console.log(`
    ██╗███╗   ██╗██╗ ██╗███╗   ███╗ █████╗ ████████╗███████╗
    ██║████╗  ██║██║ ██║████╗ ████║██╔══██╗╚══██╔══╝██╔════╝
    ██║██╔██╗ ██║██║ ██║██╔████╔██║███████║   ██║   █████╗  
    ██║██║╚██╗██║██║ ██║██║╚██╔╝██║██╔══██║   ██║   ██╔══╝  
    ██║██║ ╚████║╚████╔╝██║ ╚═╝ ██║██║  ██║   ██║   ███████╗
    ╚═╝╚═╝  ╚═══╝ ╚═══╝ ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
        `);
        console.log(`Welcome to INVMATE - System\n`);
    }

};

(async() => {
    try {
        // Display the INVMATE banner
        logger.banner();
        logger.info('Starting application initialization...');

        // Database connection
        logger.info('Establishing database connection...');
        await sequelize.authenticate();
        logger.success('Database connection established successfully');

        // Server startup
        const server = app.listen(PORT, '0.0.0.0', () => {
            logger.success(`Server running on http://127.0.0.3:${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info('Ready to handle requests');
        });

        // Handle graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                logger.info('HTTP server closed');
                sequelize.close().then(() => logger.info('Database connection closed'));
            });
        });

    } catch (error) {
        logger.error('Application initialization failed:', error);
        process.exit(1);
    }
})();