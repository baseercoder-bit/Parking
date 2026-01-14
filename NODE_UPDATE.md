# Node.js Version Update Guide

This project requires **Node.js v22.0.0 or higher**.

## Current Status
- **Required:** Node.js >= 22.0.0
- **Current:** Check with `node --version`

## Update Methods for Windows

### Option 1: Using nvm-windows (Recommended)

nvm-windows allows you to install and manage multiple Node.js versions.

#### Installation Steps:

1. **Install nvm-windows:**
   - Download from: https://github.com/coreybutler/nvm-windows/releases
   - Download `nvm-setup.exe` and run the installer
   - Restart your terminal/PowerShell after installation

2. **Verify installation:**
   ```powershell
   nvm version
   ```

3. **Install Node.js 22 (latest LTS):**
   ```powershell
   nvm install 22
   ```

4. **Use Node.js 22:**
   ```powershell
   nvm use 22
   ```

5. **Set as default (optional):**
   ```powershell
   nvm alias default 22
   ```

6. **Verify installation:**
   ```powershell
   node --version
   npm --version
   ```

7. **Install dependencies:**
   ```powershell
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

### Option 2: Direct Download from nodejs.org

1. **Visit:** https://nodejs.org/
2. **Download:** Node.js 22.x LTS installer for Windows
3. **Run the installer** and follow the installation wizard
4. **Restart your terminal/PowerShell**
5. **Verify installation:**
   ```powershell
   node --version
   npm --version
   ```

### Option 3: Using Chocolatey (if installed)

```powershell
choco upgrade nodejs-lts
```

## After Updating Node.js

1. **Update npm to latest version:**
   ```powershell
   npm install -g npm@latest
   ```

2. **Clear npm cache (recommended):**
   ```powershell
   npm cache clean --force
   ```

3. **Reinstall dependencies:**
   ```powershell
   # Backend
   cd backend
   rm -r -force node_modules  # Remove node_modules
   rm package-lock.json       # Remove lock file
   npm install                # Fresh install

   # Frontend
   cd ../frontend
   rm -r -force node_modules
   rm package-lock.json
   npm install
   ```

## Using .nvmrc File

If you have nvm-windows installed, you can automatically use the correct Node version:

```powershell
# In the project root directory
nvm use
```

This will read the `.nvmrc` file and switch to Node.js 22 automatically.

## Troubleshooting

### Port already in use
If you see port errors after updating, make sure no old Node processes are running:
```powershell
# Kill all Node processes
taskkill /F /IM node.exe
```

### Permission errors
Run PowerShell as Administrator if you encounter permission issues.

### Module not found errors
After updating Node, you may need to reinstall global packages:
```powershell
npm install -g typescript ts-node nodemon
```

## Verify Setup

After updating, verify everything works:

```powershell
# Check Node and npm versions
node --version  # Should show v22.x.x or higher
npm --version   # Should show v10.x.x or higher

# Test backend
cd backend
npm run dev

# In another terminal, test frontend
cd frontend
npm run dev
```
