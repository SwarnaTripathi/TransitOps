# 🚛 TransitOps — Smart Transport Operations Platform

> **TransitOps is a smart fleet management platform that streamlines vehicle, driver, trip, maintenance, fuel, and reporting operations through a centralized dashboard with role-based access control.**

TransitOps is a full-stack fleet management system built to digitize transport operations and improve operational efficiency. It enables fleet managers, safety officers, drivers, and financial analysts to manage vehicles, drivers, trips, maintenance records, fuel expenses, and reports through a unified web application.

---

# ✨ Features

## 🚛 Vehicle Management
- Register, update, and delete vehicles.
- Track vehicle status (Available, On Trip, In Shop, Retired).
- Store vehicle capacity, odometer, acquisition cost, and region.
- Automatically update vehicle status during trip and maintenance operations.

---

## 👨‍✈️ Driver Management
- Manage driver profiles.
- Track license details and expiry dates.
- Monitor driver availability.
- Prevent assigning suspended or expired-license drivers.

---

## 📋 Trip Management
- Create draft trips.
- Dispatch, complete, and cancel trips.
- Automatic vehicle and driver allocation.
- Cargo capacity validation.
- Planned vs Actual distance tracking.
- Fuel consumption recording.
- Vehicle odometer updates after trip completion.
- Activity logging for every trip action.

---

## 🔧 Maintenance Management
- Open and close maintenance records.
- Automatically update vehicle status to **In Shop**.
- Restore vehicle availability after maintenance completion.

---

## ⛽ Fuel & Expense Management
- Record fuel logs.
- Track operational expenses.
- Generate fuel usage history.

---

## 📊 Reports & Dashboard
- Fleet utilization overview.
- Fuel efficiency reports.
- Cost reports.
- ROI reports.
- Dashboard summary cards with operational insights.

---

## 🔐 Role-Based Access Control (RBAC)

The system supports multiple user roles with different permissions.

- 🚛 Fleet Manager
- 🛡️ Safety Officer
- 👨‍✈️ Driver
- 💰 Financial Analyst

Role switching is available in the application for demonstration and testing.

---

# 🛠 Tech Stack

### Frontend
- React (Vite)
- JavaScript (ES6+)
- CSS3
- Fetch API

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose ODM

### Other Tools
- Git & GitHub
- REST API
- ES Modules

---

# 🚀 Getting Started

## Prerequisites

- Node.js (v18 or above)
- MongoDB (Local or Atlas)

---

## Clone Repository

```bash
git clone https://github.com/SwarnaTripathi/TransitOps.git

cd TransitOps
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the backend.

```bash
npm run dev
```

(Optional)

```bash
npm run seed
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 🚛 Fleet Manager | `admin@transitops.com` | `admin123` |
| 🚛 Fleet Manager | `manager@transitops.com` | `manager123` |
| 🛡️ Safety Officer | `safety@transitops.com` | `safety123` |
| 👨‍✈️ Driver | `driver@transitops.com` | `driver123` |
| 👨‍✈️ Driver | `driver2@transitops.com` | `driver123` |
| 💰 Financial Analyst | `finance@transitops.com` | `finance123` |

> **Note:** These are demo credentials for testing the application.

---

# 📂 Project Structure

```text
TransitOps
│
├── backend
│   ├── src
│   │   ├── modules
│   │   ├── shared
│   │   ├── server.js
│   │   └── seed.js
│   └── package.json
│
├── frontend
│   ├── src
│   │   ├── modules
│   │   ├── shared
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

# 📌 Core Workflow

```text
Vehicle + Driver
        │
        ▼
Create Draft Trip
        │
        ▼
Dispatch Trip
        │
        ▼
Vehicle → On Trip

Driver → On Trip
        │
        ▼
Complete Trip
        │
        ▼
Vehicle → Available

Driver → Available

Vehicle Odometer Updated
```

---

# 📈 Reports

The application provides reports for:

- Fleet Utilization
- Fuel Efficiency
- Operational Cost
- Return on Investment (ROI)

---

# 👥 Team

Developed as part of the **Odoo Hackathon** using a modular architecture where each team member was responsible for specific functional modules.

---

# 📄 License

This project is developed for educational and hackathon purposes.
