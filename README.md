# CS308 Online Bookstore

An e-commerce book store web application built for the CS308 Software Engineering course at Sabancı University.  
Users can browse and search books, add them to a cart (as a guest or logged-in user), place orders, view order history, and request refunds. Product managers and sales managers have custom admin interfaces to manage inventory, prices, discounts, and order fulfillment.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Project Structure](#project-structure)   
- [API Endpoints](#api-endpoints)  
- [Admin Panel](#admin-panel)  
- [Testing](#testing)   
- [License](#license)  

---

## Features

- **Product catalog**: view categories, book details (title, author, description, price, stock)  
- **Search & sort**: search by name/description; sort by price or popularity  
- **Shopping cart**: add/remove items as guest or authenticated user; cart persists on login  
- **Authentication**: JWT-based login/register; role-based access control (customer, sales manager, product manager)  
- **Ordering**: place new orders, view order status (Processing, In-Transit, Delivered), request refunds (within 30 days)  
- **Payments**: integrate with Iyzico (credit card) and BTCPay Server (Bitcoin Testnet)  
- **Reviews & ratings**: leave 1–5★ reviews (pending approval) and ratings (immediate)  
- **Custom admin panel**:  
  - **Product managers**: manage products, stock, categories, view/approve comments, delivery list  
  - **Sales managers**: set prices & discounts, notify wishlist users, generate revenue reports  
- **PDF invoices**: generated on successful payment and emailed to customers  

---

## Tech Stack

- **Backend**: Django, Django REST Framework, SQLite (development)  
- **Frontend**: React (TypeScript), Axios, Material-UI, Framer Motion  
- **Auth**: JSON Web Tokens (JWT)  
- **Payments**: Iyzico Python SDK, BTCPay Server integration  
- **Email & PDF**: WeasyPrint for PDFs, SMTP for email delivery  
- **Containerization**: (coming soon) Docker & Docker Compose  

---

## Project Structure

```
.
├── backend/                  # Django project  
│   ├── admin_panel/         # Custom admin app  
│   ├── cart/                # Shopping cart logic  
│   ├── orders/              # Order placement & history  
│   ├── payment/             # Iyzico & BTCPay integrations  
│   ├── products/            # Product models & APIs  
│   ├── reviews/             # Comments & ratings  
│   ├── users/               # Custom User model & auth  
│   ├── invoices/            # PDF invoice generation  
│   ├── manage.py  
│   └── requirements.txt  
├── frontend/                 # React application  
│   ├── public/  
│   └── src/  
│       ├── components/  
│       ├── pages/  
│       ├── services/        # Axios API clients  
│       └── App.tsx  
├── .env.example  
├── docker-compose.yml       # (optional) container setup  
└── README.md  
```

---

## Frameworks & Project Overview

This e-commerce bookstore is built with **Django** and **Django REST Framework** for the backend and **React (TypeScript)** with **Material-UI** and **Framer Motion** for the frontend. User authentication is handled via JWT, and payments are processed through Iyzico and BTCPay Server. The platform allows browsing books, managing a shopping cart as a guest or authenticated user, placing orders, viewing order history, and handling refunds. Custom admin panels are provided for product and sales managers to manage inventory, set discounts, and generate reports.

## Project Description

As a course project, you will be developing a website for an online store, which interacts with a web application server. The system must:

- Present products in categories and allow users to add them to a shopping cart.
- Display stock levels and decrement stock when purchases are made.
- Allow guest browsing but require login before placing orders; carts persist on login.
- Generate and display a PDF invoice after payment, and email it to the user.
- Enable users to leave ratings (immediate) and comments (approved by product managers) on purchased products.
- Support searching and sorting products by name, description, price, or popularity; out-of-stock items remain visible but unpurchasable.
- Provide an admin interface for product and sales managers with role-based privileges.

## Setup & Run

### Backend setup:
```
python3 -m venv venv

source venv/bin/activate  # for Windows 11: .\venv\Scripts\Activate.ps1

pip3 install Django
pip3 install pycryptodome
python -m pip install Pillow
python3 manage.py runserver

# for dummy data:
pip install Faker
python generate_dummy_data.py
```

### Frontend setup:
```
npm install
npm install @mui/material @emotion/react @emotion/styled
npm install react-router-dom
npm start
```

## API Endpoints

| Method | Endpoint                     | Description                     |
| ------ | ---------------------------- | ------------------------------- |
| `GET`  | `/api/products/`             | List all books                 |
| `GET`  | `/api/products/:slug/`       | Book detail by slug            |
| `POST` | `/api/auth/register/`        | Register new user              |
| `POST` | `/api/auth/login/`           | Obtain JWT token               |
| `GET`  | `/api/cart/`                 | Retrieve current cart          |
| `POST` | `/api/cart/add/`             | Add item to cart               |
| `POST` | `/api/orders/`               | Place a new order              |
| ...    |                              |                                 |

_For full docs, see `backend/api_schema.yaml` or visit `/api/docs/` when server is running._

---

## Admin Panel

- **Product Managers**: manage products, stock, categories, view/approve comments  
- **Sales Managers**: set prices, discounts, view revenue charts  
- Access at `http://localhost:8000/admin-panel/` with appropriate credentials.

---

## Testing

- **Backend tests**  
  ```bash
  cd backend
  python manage.py test
  ```
- **Frontend tests** (Jest/RTL)  
  ```bash
  cd frontend
  npm test
  ```  

---


