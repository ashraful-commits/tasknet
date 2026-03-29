# 🚀 TaskNest: AI-Powered Project Management Platform

TaskNest is a comprehensive, production-ready MERN stack application designed for high-performance team collaboration and project management. It integrates advanced features such as multi-tenancy, AI-driven insights, real-time communication, and robust role-based access control.

---

## ✨ Features

### 🏢 Multi-Tenant Workspace Management
- **Workspace Isolation**: Securely manage multiple organizations with independent project contexts.
- **Role-Based Access Control (RBAC)**: Granular permissions for Owner, Admin, Manager, Member, and Viewer roles.
- **Team Organization**: Structure your organization into departments and sub-teams.

### 📋 Advanced Task Management
- **Multiple Views**: Visualize tasks through Kanban boards, List views, Calendars, and Timelines.
- **Task Dependencies**: Establish parent-child relationships and "blocking/blocked by" links.
- **Customization**: User-defined custom fields and reusable task templates.

### 🤖 AI-Powered Intelligence (Gemini AI)
- **Smart Suggestions**: Automatically generate task descriptions and estimate effort.
- **Predictive Analytics**: Get project health scores and identify potential bottlenecks before they happen.
- **AI Scheduling**: Optimized task sequencing and sprint planning assistance.

### 💬 Real-Time Collaboration
- **Integrated Team Chat**: Direct messaging and project-specific channels powered by Socket.io.
- **Contextual Discussions**: Task-level comments with @mentions and rich text formatting.
- **Presence Tracking**: Real-time online/offline status indicators.

### 💳 Enterprise-Grade Infrastructure
- **Subscription Management**: Tiered pricing models (Free, Pro, Enterprise) integrated with **Stripe**.
- **Secure Authentication**: Full-stack JWT implementation with 2FA support and session management.
- **File Management**: Optimized image processing (Sharp) and cloud storage via Cloudinary.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/) & [Chart.js](https://www.chartjs.org/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
- **Real-Time**: [Socket.io](https://socket.io/)
- **AI Integration**: [Google Generative AI](https://ai.google.dev/) (Gemini)
- **Payments**: [Stripe](https://stripe.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account (for file uploads)
- Stripe Account (for payments)
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tasknet
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   - Create a `.env` file in the `backend` folder (refer to `.env.example`).
   - Fill in your `MONGODB_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `CLOUDINARY_URL`, and `GEMINI_API_KEY`.
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   - Create a `.env` file in the `frontend` folder.
   - Set `VITE_API_URL` to your backend URL (e.g., `http://localhost:5000/api`).
   ```bash
   npm run dev
   ```

---

## 🏗️ Project Structure

```text
tasknet/
├── backend/            # Express API & Logic
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # API endpoints
│   │   └── utils/       # Helpers & AI logic
├── frontend/           # React Client
│   ├── src/
│   │   ├── components/  # Reusable UI parts
│   │   ├── store/       # Redux slices/API
│   │   └── pages/       # Route components
└── README.md
```

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
