#!/bin/bash

# Forum Setup Script
# This script helps you set up the forum database schema

echo "🚀 Forum Database Setup"
echo "======================="
echo ""

# Check if we're in the backend directory
if [ ! -f "Cargo.toml" ]; then
    echo "⚠️  Please run this script from the backend directory"
    echo "   cd backend && ./setup_forum.sh"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL environment variable is not set"
    echo "   Please create a .env file with:"
    echo "   DATABASE_URL=postgresql://user:password@localhost/dbname"
    exit 1
fi

echo "📊 Running database migrations..."
sqlx migrate run

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Forum database schema created successfully!"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Create an admin user by registering at /register"
    echo "   2. Update the user role in the database:"
    echo "      psql \$DATABASE_URL -c \"UPDATE users SET role = 'admin' WHERE username = 'your_username';\""
    echo "   3. Login and go to Dashboard → Manage Categories to create categories"
    echo "   4. Start creating posts!"
    echo ""
else
    echo ""
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi
