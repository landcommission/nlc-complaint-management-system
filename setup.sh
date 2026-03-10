#!/bin/bash
# NLCCMS Quick Start Script

echo "🏛️  NLCCMS — Quick Start"
echo "================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION detected"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then echo "❌ Backend install failed"; exit 1; fi
echo "✅ Backend ready"

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then echo "❌ Frontend install failed"; exit 1; fi
echo "✅ Frontend ready"

echo ""
echo "🚀 Setup complete!"
echo ""
echo "To start the system, open TWO terminals:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend && node server.js"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend && npm start"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Admin login: ken.kimathi@landcommission.go.ke / Admin@2026"
echo ""
