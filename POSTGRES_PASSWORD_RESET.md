# PostgreSQL Password Help

## Option 1: Test Your Connection (Recommended First Step)

Run this script to test different passwords:

```powershell
cd backend
npm run db:test
```

This will:
- Prompt you to enter your password
- Test the connection
- Show you the correct DATABASE_URL to use

## Option 2: Reset PostgreSQL Password (Windows)

If you forgot your PostgreSQL password, here's how to reset it:

### Method 1: Using pgAdmin 4

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. When it asks for the master password, try common passwords:
   - `postgres`
   - `admin`
   - Password you use for Windows
   - Password you set during PostgreSQL installation
3. If you get in:
   - Right-click on `PostgreSQL 18` server → Properties
   - Go to Connection tab
   - You can see the connection details

### Method 2: Reset Password via pg_hba.conf

1. **Find pg_hba.conf file:**
   - Default location: `C:\Program Files\PostgreSQL\18\data\pg_hba.conf`

2. **Edit pg_hba.conf:**
   - Open as Administrator in Notepad
   - Find this line:
     ```
     host    all             all             127.0.0.1/32            scram-sha-256
     ```
   - Change to:
     ```
     host    all             all             127.0.0.1/32            trust
     ```
   - Save the file

3. **Restart PostgreSQL:**
   - Open Services (Win+R, type `services.msc`)
   - Find `postgresql-x64-18`
   - Right-click → Restart

4. **Connect and change password:**
   ```powershell
   # Open PowerShell and connect (no password needed now)
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres

   # Once connected, run this SQL command to set new password:
   ALTER USER postgres PASSWORD 'your_new_password';

   # Exit
   \q
   ```

5. **Restore pg_hba.conf:**
   - Change `trust` back to `scram-sha-256`
   - Save the file
   - Restart PostgreSQL service again

6. **Update your .env file:**
   ```
   DATABASE_URL=postgresql://postgres:your_new_password@localhost:5483/barrenground
   ```

### Method 3: Check Environment Variables

Sometimes the password is stored in environment variables:

```powershell
# Check if PGPASSWORD is set
echo $env:PGPASSWORD

# Check PostgreSQL service properties
Get-WmiObject win32_service | Where-Object {$_.name -like '*postgre*'} | Select-Object Name, PathName
```

## Option 3: Create a New PostgreSQL User

Instead of resetting the postgres user password, create a new user:

1. **Using pgAdmin 4:**
   - Login Servers → PostgreSQL 18
   - Right-click Login/Group Roles → Create → Login/Group Role
   - General tab: Name = `barrenground`
   - Definition tab: Password = `your_password`
   - Privileges tab: Check "Can login?" and "Superuser"
   - Save

2. **Update .env:**
   ```
   DATABASE_URL=postgresql://barrenground:your_password@localhost:5483/barrenground
   ```

## Option 4: Use Windows Authentication

If you installed PostgreSQL with Windows authentication:

1. **Edit pg_hba.conf:**
   - Add this line:
     ```
     host    all             all             127.0.0.1/32            sspi
     ```

2. **Use your Windows username in .env:**
   ```
   DATABASE_URL=postgresql://YOUR_WINDOWS_USERNAME@localhost:5483/barrenground
   ```

## Quick Reference: Common Default Passwords

Try these common defaults:
- `postgres`
- `admin`
- `root`
- `password`
- `12345`
- Empty (no password)

## Verify It Works

After updating your password in `backend\.env`, test it:

```powershell
cd backend
npm run db:test
```

Or try the full setup:

```powershell
npm run db:init
```

## Still Having Issues?

If none of these work:

1. **Reinstall PostgreSQL:**
   - Uninstall PostgreSQL
   - Reinstall and carefully note the password you set
   - Remember to use port 5483 (or change it during installation)

2. **Use the backend without database:**
   ```powershell
   npm run dev:no-db
   ```
   This uses mock data and doesn't require PostgreSQL.

## Need More Help?

The error message will tell you what's wrong:
- `password authentication failed` = Wrong password
- `connection refused` = PostgreSQL not running
- `database does not exist` = Need to create database first
