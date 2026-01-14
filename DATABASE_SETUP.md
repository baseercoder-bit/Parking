# PostgreSQL Database Setup Guide

## Option 1: Install PostgreSQL Locally (Recommended for Development)

### Windows Installation Steps:

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the PostgreSQL installer from EnterpriseDB
   - Run the installer

2. **Installation Settings**
   - Choose installation directory (default is fine)
   - Select components: PostgreSQL Server, pgAdmin 4, Command Line Tools
   - Set password for the `postgres` superuser (remember this!)
   - Port: 5432 (default)
   - Locale: Default

3. **Verify Installation**
   ```powershell
   # Add PostgreSQL to PATH (if not already added)
   # Usually: C:\Program Files\PostgreSQL\{version}\bin
   
   # Test connection
   psql -U postgres -h localhost
   ```

4. **Create Database**
   ```sql
   CREATE DATABASE jamaparking;
   ```

5. **Update .env file**
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/jamaparking?schema=public"
   ```

---

## Option 2: Use Supabase (Free Cloud Database - Easiest)

1. **Sign up for Supabase**
   - Visit: https://supabase.com
   - Create a free account
   - Create a new project

2. **Get Connection String**
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI format)
   - It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

3. **Update .env file**
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?schema=public"
   ```

---

## Option 3: Use Docker (If you have Docker Desktop)

1. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop/

2. **Run PostgreSQL Container**
   ```powershell
   docker run --name jamaparking-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=jamaparking -p 5432:5432 -d postgres:15
   ```

3. **Update .env file**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jamaparking?schema=public"
   ```

---

## After Database Setup

Once you have PostgreSQL running, follow these steps:

1. **Navigate to backend directory**
   ```powershell
   cd backend
   ```

2. **Create .env file** (copy from .env.example)
   ```powershell
   copy .env.example .env
   ```
   Then edit `.env` and update `DATABASE_URL` with your connection string.

3. **Generate Prisma Client**
   ```powershell
   npm run prisma:generate
   ```

4. **Run Migrations**
   ```powershell
   npm run prisma:migrate
   ```

5. **Seed Database** (creates initial location, zones, and admin user)
   ```powershell
   npm run prisma:seed
   ```

6. **Verify Setup**
   ```powershell
   npm run prisma:studio
   ```
   This opens Prisma Studio in your browser where you can view/edit data.

---

## Default Admin Credentials (After Seeding)

- **Username:** `admin`
- **Password:** `admin123`

**⚠️ Important:** Change these credentials in production!

---

## Troubleshooting

### Connection Refused
- Make sure PostgreSQL is running
- Check if port 5432 is correct
- Verify firewall settings

### Authentication Failed
- Double-check username and password in DATABASE_URL
- For local PostgreSQL, ensure you're using the correct postgres user password

### Database Doesn't Exist
- Create it manually: `CREATE DATABASE jamaparking;`
- Or let Prisma create it (if user has CREATE DATABASE permission)

