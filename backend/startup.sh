#!/bin/bash

echo "🔧 Bookify Startup Script"
echo "=========================="
echo ""

# Step 1: Check MongoDB
echo "Step 1: Checking MongoDB..."
if pgrep -x "mongod" > /dev/null 2>&1; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is NOT running!"
    echo ""
    echo "Starting MongoDB..."
    
    # Try to start MongoDB
    if command -v brew &> /dev/null; then
        echo "Using Homebrew to start MongoDB..."
        brew services start mongodb-community
    else
        echo "⚠️  Please start MongoDB manually:"
        echo "   macOS: brew services start mongodb-community"
        echo "   Windows: net start MongoDB"
        echo ""
        exit 1
    fi
    
    # Wait for MongoDB to start
    sleep 3
fi

echo ""

# Step 2: Start Backend
echo "Step 2: Starting Backend Server..."
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env file..."
    cat > .env << 'EOF'
MONGODB_URI=mongodb://localhost:27017/bookify
JWT_SECRET=bookify_secret_key_2025_super_secure_random_string
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
EOF
    echo "✅ .env file created"
fi

echo ""
echo "🚀 Starting server on http://localhost:5000"
echo "   Press Ctrl+C to stop"
echo ""

npm run dev

