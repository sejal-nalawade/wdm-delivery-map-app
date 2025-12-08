#!/bin/bash
# Setup script for Delivery Locations Map App

echo "🚀 Setting up Delivery Locations Map App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 20.19"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated"

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "⚠️  Migration failed. You may need to run 'npx prisma migrate dev' manually"
fi

echo "✅ Database migrations applied"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Shopify App Configuration
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SCOPES=write_products,write_files

# Database
# For development (SQLite)
# DATABASE_URL="file:./dev.sqlite"

# For production (PostgreSQL)
# DATABASE_URL="postgresql://user:password@localhost:5432/delivery_map_app"

# App URL
HOST=https://your-app-url.com

# Session Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=your_session_secret_here
EOF
    echo "✅ .env file created. Please update with your credentials."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your Shopify app credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Follow the Shopify CLI prompts to connect to your app"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Getting started guide"
echo "   - DEVELOPMENT.md - Developer documentation"
echo "   - MERCHANT_GUIDE.md - Merchant instructions"
echo ""

