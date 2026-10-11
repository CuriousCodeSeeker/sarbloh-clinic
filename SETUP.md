# Sarbloh Ayurvedic Clinic – Phase 1 Setup Guide

Follow these steps **exactly in order**. Do not skip any step.

---

## STEP 0 – Create GitHub Repository (Do this first)

1. Go to https://github.com and login.
2. Click **New repository**.
3. Repository name: `sarbloh-clinic`
4. Keep it **Private** (recommended for patient data).
5. Do **NOT** add README, .gitignore or license (we already have them).
6. Click **Create repository**.
7. Copy the repository URL (example: `https://github.com/YOUR_USERNAME/sarbloh-clinic.git`).

---

## STEP 1 – Download / Open the Project Folder

The complete project is already in the folder:

```
sarbloh-clinic/
```

Open this folder in VS Code (or any editor).

---

## STEP 2 – Connect to GitHub and Push First Time

Open terminal inside the `sarbloh-clinic` folder and run:

```bash
git init
git add .
git commit -m "Phase 1: Foundation - Auth + Database Schema + Login UI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sarbloh-clinic.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your real GitHub username.

From now on, after every change you can simply run:

```bash
git add .
git commit -m "your message"
git push
```

---

## STEP 3 – Install PostgreSQL (if not already installed)

### Windows
Download from: https://www.postgresql.org/download/windows/
Install and remember the password you set for the `postgres` user.

### Mac
```bash
brew install postgresql@16
brew services start postgresql@16
```

### Ubuntu / Linux
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

## STEP 4 – Create the Database

```bash
# Open PostgreSQL
psql -U postgres

# Inside psql run:
CREATE DATABASE sarbloh_clinic;
\q
```

---

## STEP 5 – Backend Setup

```bash
cd backend

# 1. Copy environment file
cp .env.example .env

# 2. Open .env file and change DATABASE_URL
# Example for local PostgreSQL:
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/sarbloh_clinic?schema=public"

# 3. Install packages
npm install

# 4. Create database tables
npx prisma migrate dev --name init

# 5. Insert Admin + Practitioner accounts
npx prisma db seed

# 6. Start the backend
npm run start:dev
```

You should see:
```
Sarbloh API running on http://localhost:3000
```

**Keep this terminal open.**

---

## STEP 6 – Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# 1. Install packages
npm install

# 2. Start frontend
npm run dev
```

You should see:
```
Local: http://localhost:5173
```

---

## STEP 7 – Test Login

1. Open browser → http://localhost:5173
2. Login with:

| Role         | Email                      | Password   |
|--------------|----------------------------|------------|
| Admin        | admin@sarbloh.com          | Admin@123  |
| Practitioner | practitioner@sarbloh.com   | Pract@123  |

3. You should see the Dashboard with Sarbloh red + green branding.

---

## File Structure (Phase 1)

```
sarbloh-clinic/
│
├── .gitignore
├── README.md
├── SETUP.md                          ← This file
│
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma             ← Complete database design
│   │   └── seed.ts                   ← Creates Admin + Practitioner
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── jwt.strategy.ts
│       │   ├── jwt-auth.guard.ts
│       │   └── dto/
│       │       └── login.dto.ts
│       ├── prisma/
│       │   ├── prisma.module.ts
│       │   └── prisma.service.ts
│       └── common/
│           ├── decorators/
│           │   └── roles.decorator.ts
│           └── guards/
│               └── roles.guard.ts
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── services/
        │   └── api.ts
        ├── contexts/
        │   └── AuthContext.tsx
        ├── layouts/
        │   └── MainLayout.tsx
        └── pages/
            ├── LoginPage.tsx
            └── DashboardPage.tsx
```

---

## Common Problems & Solutions

**1. `npm install` fails**
→ Make sure you have Node.js 20+. Check with `node -v`

**2. Prisma migrate fails**
→ Check your DATABASE_URL in `.env`. Password must be correct.

**3. Login shows "Invalid credentials"**
→ Make sure you ran `npx prisma db seed`

**4. Frontend cannot connect to backend**
→ Backend must be running on port 3000. Frontend proxies `/api` automatically.

**5. Port already in use**
→ Change PORT in backend `.env` or kill the process using that port.

---

## After Phase 1 Works

Reply with:

**Phase 1 working – start Phase 2**

Then we will add Patient Management (one module at a time, file by file).
