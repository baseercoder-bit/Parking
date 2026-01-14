# Troubleshooting Guide

## "Failed to Load Locations" Error

If you're seeing this error, follow these steps:

### 1. Check if Backend Server is Running

The backend should be running on port 3001. Check:

```powershell
# In the backend directory
cd backend
npm run dev
```

You should see:
```
Server running on port 3001
Environment: development
```

### 2. Verify API URL Configuration

Check your frontend `.env` file (if it exists) or verify the default:

- Default API URL: `http://localhost:3001`
- Make sure this matches your backend server port

### 3. Check Database Connection

The backend needs a database connection. Verify:

```powershell
cd backend
# Check if .env file exists and has DATABASE_URL
Get-Content .env | Select-String "DATABASE_URL"
```

Make sure `DATABASE_URL` is set correctly.

### 4. Test Backend Health Endpoint

Open your browser and navigate to:
```
http://localhost:3001/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### 5. Test Locations Endpoint Directly

Try accessing:
```
http://localhost:3001/api/locations
```

You should see a JSON array of locations (or an empty array `[]`).

### 6. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab**: Look for error messages
- **Network tab**: Check if the request to `/api/locations` is failing
  - Check the status code (should be 200)
  - Check if request is being blocked (CORS, network error)

### 7. Common Issues and Solutions

#### Issue: "Cannot connect to server"
**Solution**: Make sure backend is running on port 3001

#### Issue: CORS Error
**Solution**: 
- Check `backend/.env` has `FRONTEND_URL=http://localhost:5173`
- Or update `backend/src/server.ts` CORS configuration

#### Issue: "No locations available"
**Solution**: 
- Run the seed script to create initial data:
  ```powershell
  cd backend
  npm run prisma:seed
  ```

#### Issue: Database Connection Error
**Solution**:
- Verify `DATABASE_URL` in `backend/.env`
- Make sure database is running (PostgreSQL/Supabase)
- Test connection:
  ```powershell
  cd backend
  npm run prisma:studio
  ```

### 8. Quick Fix Checklist

- [ ] Backend server is running (`npm run dev` in backend folder)
- [ ] Database is connected (check `.env` DATABASE_URL)
- [ ] At least one location exists (run `npm run prisma:seed`)
- [ ] Frontend is running (`npm run dev` in frontend folder)
- [ ] No firewall blocking port 3001
- [ ] Browser console shows no CORS errors

### 9. Reset Everything

If nothing works, try a fresh start:

```powershell
# Backend
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

### 10. Get Help

If the issue persists:
1. Check browser console for detailed error messages
2. Check backend terminal for error logs
3. Verify all environment variables are set correctly
4. Make sure all dependencies are installed (`npm install` in both folders)
