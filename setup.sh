#!/bin/bash

# Compliance Maker-Checker Automated Installer
# This script sets up the environment and starts the application.

echo "🚀 Starting Compliance Maker-Checker Setup..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt-get update -y

# 2. Install Node.js (v18) if not present
if ! command -v node &> /dev/null
then
    echo "🟢 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js is already installed ($(node -v))"
fi

# 3. Install Dependencies
echo "📥 Installing project dependencies..."
npm install

# 4. Setup Environment
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
fi

# 5. Build the Application
echo "🏗️ Building the React application..."
npm run build

# 6. Start the Application
echo "✨ Setup complete!"
echo "--------------------------------------------------"
echo "The application is starting on http://localhost:3000"
echo "If you are on a VM, use http://<VM_IP>:3000"
echo "--------------------------------------------------"

npm run start
