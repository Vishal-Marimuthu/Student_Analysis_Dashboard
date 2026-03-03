# 🎓 Student Analysis Dashboard

A full-stack web application for university administrators to monitor, analyze, and manage student academic performance across semesters and subjects.

---

## 🏗️ Tech Stack

![Tech Stack Diagram](./tech_stack.png)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 | UI component library |
| | Vite | Build tool & dev server |
| | React Router DOM | Client-side routing |
| | Recharts | Data visualization & charts |
| | Axios | HTTP client for API calls |
| | Lucide React | Icon library |
| **Backend** | Node.js | JavaScript runtime |
| | Express.js | Web framework & REST API |
| | JSON Web Tokens (JWT) | Authentication & authorization |
| | bcryptjs | Password hashing |
| | dotenv | Environment variable management |
| | Nodemon *(dev)* | Auto-restart during development |
| **Database** | MySQL | Relational database |
| | mysql2 | Node.js MySQL driver |

---

## � Application Flow

```mermaid
flowchart TD
    A([🌐 User Visits App]) --> B{Has saved\nsession?}

    B -- Yes --> C[Restore token\nfrom localStorage]
    B -- No --> D[/Login Page/]

    C --> E{Role?}
    D --> F[Enter credentials]
    F --> G[[POST /api/auth/login\nExpress + JWT]]
    G -- ❌ Invalid --> D
    G -- ✅ Valid --> H[Store JWT &\nuser in localStorage]
    H --> E

    E -- Admin --> I[🛠️ Admin Dashboard]
    E -- Student --> J[🎓 Student Dashboard]

    %% Admin flow
    I --> I1[View All Students\nGET /api/admin/students]
    I --> I2[Add New Student\nPOST /api/admin/students]
    I --> I3[Add / Update Marks\nPOST /api/admin/marks]
    I --> I4[View Department Rankings\nGET /api/admin/rankings]
    I --> I5[Browse by Subject\nGET /api/admin/subjects]

    I2 --> I2a[(Create User\n& Student in MySQL)]
    I3 --> I3a[(Upsert student_marks\nin MySQL)]

    %% Student flow
    J --> J1[View Personal Marks\nGET /api/student/marks]
    J --> J2[View Performance Charts\nRecharts]
    J --> J3[See Semester Progress]

    %% Auth middleware
    I1 & I2 & I3 & I4 & I5 & J1 & J2 & J3 --> MW[[🔒 JWT Auth Middleware\nverifyToken]]

    style A fill:#6366f1,color:#fff,stroke:none
    style I fill:#0ea5e9,color:#fff,stroke:none
    style J fill:#10b981,color:#fff,stroke:none
    style MW fill:#f59e0b,color:#fff,stroke:none
    style G fill:#8b5cf6,color:#fff,stroke:none
```

---

## �📁 Directory Layout

```
Miniproject2/
├── frontend/
│   ├── admin-panel/    # Admin dashboard (React + Vite)
│   └── student-panel/  # Student view (React + Vite)
└── backend/            # REST API (Node.js + Express)
    ├── config/         # DB & app configuration
    ├── controllers/    # Route handlers
    ├── middleware/     # Auth middleware
    ├── models/         # Database models
    └── routes/         # API route definitions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MySQL server running locally

### Backend

```bash
cd backend
npm install
# Copy .env.example to .env and fill in your credentials
cp .env.example .env
npm run dev
```

### Frontend (Admin Panel)

```bash
cd frontend/admin-panel
npm install
npm run dev
```

### Frontend (Student Panel)

```bash
cd frontend/student-panel
npm install
npm run dev
```
