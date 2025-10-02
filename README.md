# Pambo - Beauty Shop

Pambo is a full-stack e-commerce platform designed to provide a convenient and seamless online shopping experience for beauty products. It allows customers to browse a wide range of products, manage their cart, and complete purchases securely, while providing administrators with a powerful dashboard to manage products, users, and orders.

---

## Live Links

* [Live Application](https://group-8-beauty-shop.onrender.com)
* [Repository](https://github.com/Thigzz/Group-8-Beauty-Shop)

---

## Table of Contents

* [Features](#features)

  * [Customer Features](#customer-features)
  * [Admin Features](#admin-features)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Backend Setup (Flask)](#backend-setup-flask)
  * [Frontend Setup (React)](#frontend-setup-react)
* [Running Tests](#running-tests)

  * [Backend Tests](#backend-tests)
  * [Frontend Tests](#frontend-tests)
  * [API Testing with Postman](#api-testing-with-postman)
* [Deployment](#deployment)
* [Contributors](#contributors)
* [License](#license)

---

## Features

### Customer Features

1. Authentication: Secure user registration and login.
2. Product Browsing: Browse products by categories.
3. Search and Filter: Efficient search and filtering.
4. Product Details: Detailed product view with images, descriptions, and pricing.
5. Shopping Cart: Add, edit, and remove items.
6. Checkout Process: Secure and simulated checkout with invoicing.
7. Order Management: Order confirmations and complete history.

### Admin Features

1. Secure Dashboard: Comprehensive management dashboard with secure login.
2. Product Management: Full CRUD operations on beauty products.
3. User Management: Manage user accounts and roles.
4. Order Oversight: View and filter customer orders.
5. Analytics: Sales, orders, and customer insights.
6. Fulfillment Simulation: Invoicing and order workflow simulation.
7. Reporting: Export detailed order and product reports.

---

## Tech Stack

**Frontend:** React, Redux, Vite
![React](https://img.shields.io/badge/Frontend-React-blueviolet)

**Backend:** Flask, SQLAlchemy, PostgreSQL
![Flask](https://img.shields.io/badge/Backend-Flask-green) ![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-informational)

**Testing:** Pytest, Jest
![Tests](https://img.shields.io/badge/Tests-Pytest%20%7C%20Jest-success)

**Tools & Deployment:** GitHub Actions, Render, Postman
![Deployment](https://img.shields.io/badge/Deployed%20on-Render-orange)

**License:** MIT
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

---

## Project Structure

```
Group-8-Beauty-Shop/
├── client/             # React Frontend
│   ├── public/
│   └── src/
│       ├── api/
│       ├── assets/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── redux/
│       └── ...
├── server/             # Flask Backend
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── config.py
│   │   ├── seed.py
│   │   └── ...
│   ├── migrations/
│   ├── tests/
│   └── app.py
└── ...                 # Root config files
```

---

## Getting Started

### Prerequisites

1. Python (3.8+ recommended)
2. Node.js and npm (14+ recommended)
3. PostgreSQL

### Backend Setup (Flask)

1. Clone the repository

   ```bash
   git clone https://github.com/Thigzz/Group-8-Beauty-Shop.git
   ```
2. Navigate to the backend directory

   ```bash
   cd Group-8-Beauty-Shop/server
   ```
3. Create and activate a virtual environment

   * On macOS/Linux:

     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
   * On Windows:

     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
4. Install dependencies

   ```bash
   pip install -r requirements.txt
   ```
5. Set up environment variables

   * Create a `.env` file inside the `server/` directory.
   * Add the following:

     ```env
     FLASK_APP=app.py
     FLASK_ENV=development
     DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
     JWT_SECRET_KEY=your_super_secret_key
     ```
6. Run database migrations

   ```bash
   flask db upgrade
   ```
7. Seed the database (optional)

   ```bash
   flask seed-db
   ```
8. Run the backend server

   ```bash
   flask run
   ```

   The server will be running at `http://127.0.0.1:5555`.

### Frontend Setup (React)

1. Navigate to the frontend directory

   ```bash
   cd ../client
   ```
2. Install npm dependencies

   ```bash
   npm install
   ```
3. Run the development server

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`.

---

## Running Tests

### Backend Tests

1. Navigate to the backend directory

   ```bash
   cd server
   ```
2. Run tests

   ```bash
   pytest
   ```

### Frontend Tests

1. Navigate to the frontend directory

   ```bash
   cd client
   ```
2. Run tests

   ```bash
   npm test
   ```

### API Testing with Postman

1. Open Postman.
2. Set base URL: `https://group-8-beauty-shop.onrender.com/`
3. Find API endpoints in: `server/Routes.md`
4. For protected routes:

   * Authenticate via `POST /login`
   * Copy the JWT token from the response
   * Add it to headers as:

     ```
     Authorization: Bearer <your_jwt_token>
     ```

---

## Deployment

1. CI/CD is configured with GitHub Actions.
2. Pushes to the main branch trigger automatic build and deployment on Render.

---

## Contributors

* Thigzz
* rsiyoi
* justin-0100
* Simonwarui01

---

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.
