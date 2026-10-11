# Sarbloh Ayurvedic Clinic – Management System

Production-grade web application for **Sarbloh Ayurvedic Clinic** (Clinic + Medical Shop).

**Brand colors**: Deep Red (`#C41E3A`) + Olive Green (`#6B8E23`) – matching the official Sarbloh logo.

---

## Phase 1 – Foundation (Completed)

What is included in this phase:

- Complete project structure (Backend + Frontend)
- Full Prisma database schema (normalized, production-ready)
- Authentication system (JWT)
- Only two roles: **Admin** and **Practitioner**
- Seed data (Admin + Practitioner accounts + clinic settings + medicine categories)
- Clean login page
- Protected layout with sidebar navigation
- Dashboard placeholder with correct branding and quick actions
- API structure ready for all future modules

---

## Prerequisites

- Node.js 20 or higher
- PostgreSQL 14+ (16 recommended)
- npm

---

## Setup Instructions

### 1. Create the Database

```bash
# Using createdb (if available)
createdb sarbloh_clinic

# OR using psql
psql -U postgres
CREATE DATABASE sarbloh_clinic;
\q
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env and set your real DATABASE_URL
# Example:
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/sarbloh_clinic?schema=public"

# Install dependencies
npm install

# Generate Prisma client + run migration
npx prisma migrate dev --name init

# Seed the database (creates Admin + Practitioner)
npx prisma db seed

# Start the API
npm run start:dev
```

Backend runs at: **http://localhost:3000**

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Default Login Credentials

| Role         | Email                      | Password   |
|--------------|----------------------------|------------|
| Admin        | admin@sarbloh.com          | Admin@123  |
| Practitioner | practitioner@sarbloh.com   | Pract@123  |

---

## Project Structure

```
sarbloh-clinic/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      ← Full database schema
│   │   └── seed.ts            ← Seed data
│   ├── src/
│   │   ├── auth/              ← Login, JWT, guards
│   │   ├── prisma/            ← Prisma service
│   │   ├── common/            ← Shared guards & decorators
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── contexts/          ← AuthContext
│   │   ├── layouts/           ← MainLayout (sidebar)
│   │   ├── pages/             ← Login + Dashboard
│   │   ├── services/          ← API client
│   │   └── App.tsx
│   ├── tailwind.config.js     ← Sarbloh brand colors
│   └── package.json
│
└── README.md
```

---

## How to Test Phase 1

1. Start PostgreSQL and create the database.
2. Run backend setup commands (migrate + seed).
3. Run frontend.
4. Open http://localhost:5173
5. Login with either Admin or Practitioner credentials.
6. You should see the clean dashboard with Sarbloh branding and sidebar.

If login works and you reach the dashboard, **Phase 1 is successful**.

---

## Next Step

After you confirm Phase 1 is working on your machine, reply:

**“Phase 1 working – start Phase 2”**

We will then implement **Patient Management** (register, search, list, profile).

---

## Notes

- All business logic stays in the backend.
- Frontend is a pure API consumer.
- Database is designed for future mobile app / POS / e-commerce.
- Stock will always be managed through inventory transactions (never a simple number).
- Patient history is append-only.
