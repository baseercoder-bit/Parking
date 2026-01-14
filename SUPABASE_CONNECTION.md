# Supabase Connection Guide

## Important: Connection Pooling for Supabase

Supabase provides two types of connection strings:

### 1. Direct Connection (Port 5432)
- **Use for:** Migrations, Prisma Studio, one-off scripts
- **Format:** `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 2. Connection Pooler (Port 6543) ⭐ **RECOMMENDED FOR APPLICATIONS**
- **Use for:** Application connections (your backend server)
- **Format:** `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`
- **Why:** Handles connection pooling, prevents connection exhaustion, better for production

## Setting Up Your DATABASE_URL

### For Application (Backend Server)

In your `backend/.env` file, use the **Connection Pooler** URL:

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### For Migrations and Prisma Studio

When running migrations or Prisma Studio, you can temporarily use the direct connection:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

## How to Find Your Connection Strings

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Under **Connection string**, you'll see:
   - **URI** (direct connection - port 5432)
   - **Connection pooling** (pooler - port 6543) ⭐ Use this for your app

## Troubleshooting Data Not Persisting

If data is not persisting to Supabase:

1. **Check Connection String:**
   - Make sure you're using the **pooler** URL (port 6543) for your application
   - Verify the password is correct (no extra spaces or special characters)

2. **Check Backend Logs:**
   - Look for Prisma query logs in your terminal
   - Check for any error messages

3. **Verify Database Connection:**
   ```powershell
   cd backend
   npm run prisma:studio
   ```
   This will open Prisma Studio. Check if you can see your data there.

4. **Test Direct Connection:**
   - Temporarily switch to direct connection URL
   - Try updating spots again
   - If it works with direct connection but not pooler, there might be a pooler configuration issue

5. **Check Supabase Dashboard:**
   - Go to your Supabase project → Table Editor
   - Verify if data is actually being saved
   - Check the `updated_at` timestamp

## Common Issues

### Issue: "Connection timeout"
- **Solution:** Use the connection pooler URL instead of direct connection

### Issue: "Too many connections"
- **Solution:** You're likely using direct connection. Switch to pooler URL

### Issue: "Data updates but doesn't persist"
- **Solution:** Check if you're using transactions correctly. The updated code includes transaction handling.

## Example .env Configuration

```env
# For application (use pooler)
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# JWT Secret
JWT_SECRET="your-secret-key-here"

# Port
PORT=3001

# Frontend URL
FRONTEND_URL="http://localhost:5173"
```

## After Updating DATABASE_URL

1. Restart your backend server
2. Test the connection:
   ```powershell
   cd backend
   npm run prisma:studio
   ```
3. If Prisma Studio opens successfully, your connection is working
