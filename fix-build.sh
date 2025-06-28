#!/bin/bash

echo "🔧 Starting Expo build fix for API 35 in Replit..."

# Step 1: Clean everything
echo "📦 Cleaning project..."
rm -rf node_modules
rm -rf android
rm -rf ios
rm -rf .expo
rm -f package-lock.json
rm -f yarn.lock

# Step 2: Install dependencies
echo "📥 Installing dependencies..."
npm install

# Step 3: Clear Expo cache
echo "🧹 Clearing Expo cache..."
npx expo install --fix

# Step 4: Prebuild with clean flag
echo "🏗️ Running prebuild..."
npx expo prebuild --clean --platform android

echo "✅ Basic setup completed!"
echo "Now run the manual gradle fixes..."