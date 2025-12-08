@echo off
REM Setup script for Delivery Locations Map App (Windows)

echo ========================================
echo Setting up Delivery Locations Map App
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js ^>= 20.19
    exit /b 1
)

echo [OK] Node.js version:
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed
    exit /b 1
)

echo [OK] npm version:
npm --version
echo.

REM Install dependencies
echo [STEP 1/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Generate Prisma client
echo [STEP 2/4] Generating Prisma client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate Prisma client
    exit /b 1
)
echo [OK] Prisma client generated
echo.

REM Run database migrations
echo [STEP 3/4] Running database migrations...
call npx prisma migrate deploy
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Migration failed. You may need to run 'npx prisma migrate dev' manually
)
echo [OK] Database migrations applied
echo.

REM Create .env file if it doesn't exist
echo [STEP 4/4] Checking environment configuration...
if not exist .env (
    echo Creating .env file...
    (
        echo # Shopify App Configuration
        echo SHOPIFY_API_KEY=your_api_key_here
        echo SHOPIFY_API_SECRET=your_api_secret_here
        echo SCOPES=write_products,write_files
        echo.
        echo # Database
        echo # For development ^(SQLite^)
        echo # DATABASE_URL="file:./dev.sqlite"
        echo.
        echo # For production ^(PostgreSQL^)
        echo # DATABASE_URL="postgresql://user:password@localhost:5432/delivery_map_app"
        echo.
        echo # App URL
        echo HOST=https://your-app-url.com
        echo.
        echo # Session Secret
        echo SESSION_SECRET=your_session_secret_here
    ) > .env
    echo [OK] .env file created. Please update with your credentials.
) else (
    echo [OK] .env file already exists
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Update .env file with your Shopify app credentials
echo   2. Run 'npm run dev' to start the development server
echo   3. Follow the Shopify CLI prompts to connect to your app
echo.
echo Documentation:
echo   - README.md - Getting started guide
echo   - DEVELOPMENT.md - Developer documentation
echo   - MERCHANT_GUIDE.md - Merchant instructions
echo.
pause

