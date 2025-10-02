# 🛍️ Beauty Shop Application

The Beauty Shop Application is a full-stack e-commerce platform that allows users to browse products, manage their carts, place orders, and track invoices. Admins can manage products view overall performance and manage customers on the platform.

## 🌐 Live Demo

The application is deployed and live. You can access it here:

* **Frontend:** **[PAMBO](https://pambo.onrender.com/)**
* **Backend API:** **[PAMBO](https://group-8-beauty-shop.onrender.com/)**


## Tools Used

- Frontend: React, Redux Toolkit, TailwindCSS, React Router

- Backend: Flask, SQLAlchemy, Alembic

- Database: PostgreSQL (or SQLite for development)

- Testing: Jest (frontend), Pytest (backend)

- Others: Vite, Axios

## Setup Instructions
1. Clone the Repository

    ``git clone git@github.com:Thigzz/Group-8-Beauty-Shop.git``

    ``cd Group-8-Beauty-Shop``

2. Backend Setup

    `cd server`

    `python3 -m venv venv`

    `source venv/bin/activate`  # (Linux/Mac)

    `venv\Scripts\activate`     # (Windows)

    `pip install -r requirements.txt`

    `flask db upgrade`  # apply migrations

    `flask run`


The backend will run at http://127.0.0.1:5000

3. Frontend Setup

    `cd client`

    `npm install`

    `npm run dev`


The frontend will run at http://localhost:5173

## Running the Application

- Start the backend server (flask run).

- Start the frontend (npm run dev).

- Open your browser at http://localhost:5173 to access the app.

## Features




## Screenshots
1. Landing Page

2. User Registration & Login

3. User Dashboard

4. Admin ddashboard

5. Cart page

6. Checkout

7. Order Confirmation

## Authors / Acknowledgement

Ruth Siyoi

Ike Mwithiga

Justin Kipkorir

Simon Warui



## License

This project is licensed under the MIT License