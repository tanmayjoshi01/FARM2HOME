#!/bin/bash

echo "================================"
echo "FARM2HOME Backend Server"
echo "================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "Please create .env with:"
    echo "  DATABASE_URL=postgresql://user:password@localhost:5432/farm2home"
    echo "  JWT_SECRET=your_secret_key"
    echo "  PORT=5000"
    echo ""
    echo "After creating .env, run this script again."
    exit 1
fi

echo "✓ Starting server..."
echo "🚀 Server running on http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
