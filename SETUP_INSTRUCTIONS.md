# Database Setup Instructions

## Your Supabase Connection String

You have provided:
```
DATABASE_URL="postgresql://postgres.dccnxyfwvazfnpquxnuy:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## Step 1: Update .env File

1. Open `backend/.env` file
2. Find the `DATABASE_URL` line
3. Replace `[YOUR-PASSWORD]` with your actual Supabase database password
4. Save the file

**Important Note**: The connection string uses `pgbouncer=true` (connection pooler). 
If migrations fail, you may need to use the **direct connection string** instead:
- Go to Supabase Dashboard → Project Settings → Database
- Copy the "Connection string" under "Connection pooling" → "Direct connection"
- It will use port `5432` instead of `6543` and won't have `pgbouncer=true`

## Step 2: Generate Prisma Client

```powershell
cd backend
npm run prisma:generate
```

## Step 3: Run Database Migrations

```powershell
npm run prisma:migrate
```

This will:
- Create all database tables (locations, zones, admins)
- Set up relationships and constraints

## Step 4: Seed Initial Data

```powershell
npm run prisma:seed
```

This creates:
- 1 location: "Main Mosque Parking"
- 3 zones: Zone A (50 spots), Zone B (40 spots), Zone C (30 spots)
- 1 admin user:
  - Username: `admin`
  - Password: `admin123`

## Step 5: Verify Setup

Open Prisma Studio to view your data:
```powershell
npm run prisma:studio
```

This opens a web interface at http://localhost:5555 where you can view/edit your database.

## Troubleshooting

### If migrations fail with pgbouncer:

Use the **direct connection** string from Supabase:
- Port: `5432` (not 6543)
- Remove `?pgbouncer=true`
- Format: `postgresql://postgres.dccnxyfwvazfnpquxnuy:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres`

### Connection refused:

- Check your Supabase project is active
- Verify password is correct
- Ensure IP is not blocked (Supabase allows all IPs by default)

### Migration errors:

- Make sure database exists (Supabase creates it automatically)
- Check user has proper permissions
- Try using direct connection instead of pooler

