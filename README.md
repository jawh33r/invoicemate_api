# INVMATE - Client & Invoice Management System

INVMATE is a powerful, full-stack client and invoice management system built with Node.js, Express, and Sequelize for the backend, with a focus on managing clients and generating invoices. This project includes protected routes for client creation, updates, deletion, and more.

---

## 🚀 Features

- **User Authentication**: Secure login and JWT token-based authentication.
- **Client Management**: Create, read, update, and delete clients associated with the logged-in user.
- **Invoice Management**: Generate invoices with customizable fields (e.g., client information, invoice amount).
- **Database**: Uses PostgreSQL with Sequelize ORM for data handling.
- **Environment Management**: Configurable environment variables for portability.
- **Error Handling**: Robust logging and error management with custom messages.
  
---

## 🛠️ Technologies Used

- **Backend**: Node.js, Express
- **Database**: PostgreSQL, Sequelize
- **Authentication**: JWT-based token authentication
- **Logging**: Winston for structured logging
- **Environment Variables**: dotenv for managing app configurations

---
🧩 Dependencies
Here are the main dependencies used in this project:

- **bcrypt**: For secure password hashing (^5.1.1)
- **body-parser**: Middleware to parse request bodies (^1.20.3)
- **cors**: Middleware for enabling Cross-Origin Resource Sharing (^2.8.5)
- **dotenv**: For environment variable management (^16.4.7)
- **express**: Web framework for Node.js (^4.21.2)
- **jsonwebtoken**: For generating JWT tokens (^9.0.2)
- **pdfkit**: For generating PDFs (^0.16.0)
- **pg**: PostgreSQL client for Node.js (^8.13.1)
- **pg-hstore**: For serializing and deserializing JSON objects (^2.3.4)
- **puppeteer**: Headless browser for web scraping (^24.1.1)
- **sequelize**: ORM for PostgreSQL (^6.37.5)
---
## 💻 Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/jawh33r/invoicemate_api.git
    ```

2. Navigate into the project directory:
    ```bash
    cd invmateapi
    ```

3. Install the dependencies:
    ```bash
    npm install
    ```

4. Set up environment variables by creating a `.env` file in the root directory:
    ```bash
    PORT=8000
    NODE_ENV=development
    DB_HOST=localhost
    DB_USER=your-database-username
    DB_PASS=your-database-password
    DB_NAME=invmate
    ```

5. Run the database migration to set up the schema:
    ```bash
    npx sequelize-cli db:migrate
    ```

6. Start the application:
    ```bash
    npm run dev
    ```

---

## 📡 API Endpoints

### **User Routes**

- `POST /api/users/login`: User login to get JWT token (protected routes require this token).
  
### **Client Routes (Protected)**

- `POST /api/clients`: Create a new client (authentication required).
- `GET /api/clients`: Get all clients for the logged-in user (authentication required).
- `PUT /api/clients/:id`: Update a specific client (authentication required).
- `DELETE /api/clients/:id`: Delete a client (authentication required).

### **Invoice Routes**

- `POST /api/invoices`: Generate a new invoice (authentication required).
  
---

## 📝 Example Requests

### **Create a Client**

**POST** `/api/clients`

```json
{"company_name":"Client 1",
"fisical_code":"XXXXXXXX",
"address":"123 Main Street",
"zip_code":"XXXX",
"phone":"+1234567890",
"email":"contact@email.com",
"country":"COUNTRY TAG",
"user_id":0}
```
Get Clients
GET /api/clients

⚠️ Error Handling
400 Bad Request: When required data is missing or invalid.
401 Unauthorized: If authentication is required but no valid token is provided.
404 Not Found: If a resource (client/invoice) is not found.
500 Internal Server Error: In case of server-side issues.
🎉 Contributing
Contributions are welcome! Feel free to fork the repository, create a new branch, and submit a pull request with your changes.

📜 License
This project is licensed under the MIT License.

💬 Questions?
If you have any questions, feel free to reach out via GitHub issues or email!

🌟 INVMATE - Your client and invoice management system!
