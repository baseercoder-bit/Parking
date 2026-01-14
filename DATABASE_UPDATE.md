# Database Update Guide

## Yes, the database needs to be updated!

The Prisma schema has been updated to include a `description` field for zones. You need to update your database to match the schema.

## How to Update the Database

### Option 1: Using Prisma Migrate (Recommended for Production)

This creates a migration file that tracks the changes:

```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate
```

When prompted:
- **Migration name**: Enter something like `add_zone_description` or just press Enter for the default name
- Prisma will create a migration file and apply it to your database

### Option 2: Using Prisma DB Push (Quick for Development)

This directly pushes schema changes without creating migration files:

```powershell
cd backend
npm run prisma:generate
npx prisma db push
```

**Note**: This is faster but doesn't create migration history. Use this for development only.

## Step-by-Step Instructions

1. **Navigate to backend directory:**
   ```powershell
   cd backend
   ```

2. **Generate Prisma Client** (updates the client to match schema):
   ```powershell
   npm run prisma:generate
   ```

3. **Update Database Schema:**

   **For development (quick):**
   ```powershell
   npx prisma db push
   ```

   **For production (with migration history):**
   ```powershell
   npm run prisma:migrate
   ```

4. **Verify the update:**
   ```powershell
   npx prisma studio
   ```
   This opens Prisma Studio. Check the `zones` table - it should now have a `description` column.

## What Changes Will Be Made

The migration will:
- Add a `description` column to the `zones` table
- Set it as nullable (optional field)
- Set the column type to TEXT

**Existing zones** will have `NULL` for description, which is fine - it's an optional field.

## Troubleshooting

### Error: "Database is being accessed by other users"
- Make sure no other applications are connected to the database
- Close Prisma Studio if it's open
- Try again

### Error: "Migration failed"
- Check your `DATABASE_URL` in `.env` is correct
- Make sure the database is running
- Check database connection permissions

### Error: "Schema drift detected"
- This means your database schema doesn't match Prisma schema
- Run `npx prisma db push --accept-data-loss` (⚠️ only if you're okay with data loss)
- Or manually fix the schema differences

## After Updating

1. **Restart your backend server** if it's running:
   ```powershell
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

2. **Test the application:**
   - Try creating a new zone with a description
   - Edit an existing zone to add a description
   - Verify descriptions appear in the UI

## Quick Command Reference

```powershell
# Full update process
cd backend
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Create and apply migration
# OR
npx prisma db push         # Quick push (dev only)

# Verify
npx prisma studio          # Open database viewer
```
