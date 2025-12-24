#!/bin/bash
# Quick script to deploy migrations to Vercel Postgres

echo "🚀 NASCAR Fantasy League - Database Migration Script"
echo ""
echo "This script will:"
echo "  1. Connect to your Vercel Postgres database"
echo "  2. Create all required tables"
echo "  3. Seed with sample data (optional)"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set!"
    echo ""
    echo "To get your DATABASE_URL from Vercel:"
    echo "  1. Go to Vercel Dashboard → Storage → Your Postgres Database"
    echo "  2. Click '.env.local' tab"
    echo "  3. Copy the POSTGRES_PRISMA_URL value"
    echo "  4. Run: export DATABASE_URL=\"your-url-here\""
    echo "  5. Run this script again"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

# Run migrations
echo "📊 Running migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Migration failed!"
    echo "Check that DATABASE_URL is correct and accessible."
    exit 1
fi

echo ""
echo "✅ Tables created successfully!"
echo ""

# Ask about seeding
read -p "Do you want to add sample data (admin user, test drivers, races)? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    npx prisma db seed
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Sample data added!"
        echo ""
        echo "📝 Login credentials:"
        echo "   Admin: admin@nascar.com / admin123"
        echo "   User1: user1@example.com / password123"
        echo "   User2: user2@example.com / password123"
    fi
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Add AUTH_SECRET to Vercel environment variables"
echo "  2. Redeploy in Vercel"
echo "  3. Visit https://nascar.klosdigital.com"
echo ""

