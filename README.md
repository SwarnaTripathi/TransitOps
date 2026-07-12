# TransitOps — Smart Transport Operations Platform

> **TransitOps doesn't just digitize fleet records — it flags fuel-cost anomalies automatically, prioritizes safety-compliance risk, and gives every operator a live audit trail of what's happening across the fleet in real time.**

TransitOps is a comprehensive, scalable fleet management solution designed to digitize and optimize daily transport operations. Built with a contract-first architecture, it provides an end-to-end workflow for fleet managers, dispatchers, safety officers, and financial analysts to collaborate seamlessly on a single unified platform.

---

## ✨ Key Features

*   **Role-Based Access Control (RBAC):** Tailored views and permissions for `Fleet Manager`, `Dispatcher`, `Safety Officer`, and `Financial Analyst`.
*   **Intelligent Trip Dispatch:** Context-aware trip creation that automatically filters out vehicles that are "In Shop", "Retired", or already "On Trip". Enforces strict cargo capacity constraints.
*   **Fuel Anomaly Detection (Novelty Feature):** Employs a rolling-average baseline to instantly flag fuel logs that fall 25%+ below expected efficiency, highlighting potential fuel theft or mechanical issues.
*   **Lifecycle State Engine:** Shared status engine automatically flips vehicle status across modules (e.g., Opening a maintenance log instantly marks the vehicle as "In Shop" system-wide).
*   **Robust Data Integrity:** Employs strict **Zod** input validation on all incoming API requests and uses **Soft Deletes** (`isDeleted: true`) to ensure historical financial and reporting data remains intact indefinitely.

---

## 🛠 Tech Stack

*   **Frontend:** React (Vite), Tailwind CSS, Recharts (for Analytics)
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (Atlas) & Mongoose ODM
*   **Architecture:** Monorepo, ESM modules (`"type": "module"`), feature-sliced directory structure.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/SwarnaTripathi/TransitOps.git
cd TransitOps
```

### 2. Backend Setup
```bash
cd backend
npm install
```
*   Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
*   Seed the database with initial demo data:
```bash
npm run seed
```
*   Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
*   Start the Vite development server:
```bash
npm run dev
```

---

## 📂 Project Structure (Monorepo)

```text
TransitOps/
├── frontend/
│   ├── src/
│   │   ├── modules/       # Feature-sliced React pages (vehicles, trips, etc.)
│   │   ├── shared/        # Reusable API instances, components, and contexts
│   │   └── App.jsx        # Routing and Layout Shell
│   └── package.json
└── backend/
    ├── src/
    │   ├── modules/       # Feature-sliced Express controllers & routes
    │   ├── shared/        # Auth guards, Zod validation, and Status Engine
    │   ├── server.js      # Main Express application entry point
    │   └── seed.js        # Database seeder for demo environments
    └── package.json
```

---

## 📊 Analytics & Reporting

The built-in Financial Analyst dashboard provides real-time computations for:
*   **Fleet Utilization %**
*   **Fuel Efficiency** (Rolling averages and anomaly tracking)
*   **Total Operational Cost** (Maintenance + Expenses)
*   **Trip ROI**

*Developed for the EcoSphere Challenge / ESG Engagement Platform.*
