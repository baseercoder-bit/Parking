# Quick Start Guide - Database Setup

## Choose Your PostgreSQL Setup Method

### 🚀 Option 1: Supabase (Easiest - Free Cloud Database)

1. **Sign up**: Go to https://supabase.com and create a free account
2. **Create project**: Click "New Project" → Choose a name → Set a database password
3. **Get connection string**: 
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI format)
   - It looks like: `postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
4. **Update .env**: Edit `backend/.env` and paste your connection string

**Advantages**: No installation needed, free tier, works immediately

---

### 💻 Option 2: Local PostgreSQL Installation

1. **Download**: https://www.postgresql.org/download/windows/
2. **Install**: Run installer, remember the postgres user password
3. **Create database**: Open pgAdmin or run:
   ```sql
   CREATE DATABASE jamaparking;
   ```
4. **Update .env**: Edit `backend/.env`:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/jamaparking?schema=public"
   ```

---

### 🐳 Option 3: Docker (If you have Docker Desktop)

```powershell
docker run --name jamaparking-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=jamaparking -p 5432:5432 -d postgres:15
```

Then use: `postgresql://postgres:postgres@localhost:5432/jamaparking?schema=public`

---

## After Database is Ready

Run the setup script:

```powershell
cd backend
.\setup-database.ps1
```

Or manually:

```powershell
cd backend

# 1. Create .env file (if not exists)
copy .env.example .env
# Then edit .env with your DATABASE_URL

# 2. Generate Prisma Client
npm run prisma:generate

# 3. Run migrations
npm run prisma:migrate

# 4. Seed database
npm run prisma:seed
```

---

## Default Admin Login (After Seeding)

- **Username**: `admin`
- **Password**: `admin123`

⚠️ Change these in production!

