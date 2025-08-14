# 🗄️ Pizza Party Database Setup

This document explains how to set up and use the PostgreSQL database for Pizza Party game data caching and user profiles.

## 📋 Overview

The database provides:
- **Performance optimization** - Fast leaderboard queries
- **User profiles** - Usernames, avatars, achievements
- **Historical data** - Game events and analytics
- **Real-time sync** - Blockchain event listeners

## 🚀 Quick Setup

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE pizza_party;

# Create user (optional)
CREATE USER pizza_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pizza_party TO pizza_user;

# Exit
\q
```

### 3. Configure Environment

Create or update your `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pizza_party
DB_USER=postgres
DB_PASSWORD=your_password

# Blockchain Configuration
BASE_RPC_URL=https://mainnet.base.org
PRIVATE_KEY=your_private_key

# Environment
NODE_ENV=development
```

### 4. Install Dependencies

```bash
npm install pg @types/pg
```

### 5. Run Database Setup

```bash
node scripts/setup-database.js
```

### 6. Start Blockchain Listener

```bash
node scripts/start-listener.js
```

## 📊 Database Schema

### Core Tables

#### `users`
- User profiles with usernames and avatars
- Wallet address as unique identifier
- Bio and activity tracking

#### `player_stats`
- Cached player statistics from blockchain
- Toppings, entries, referrals, VMF balance
- Updated via blockchain events

#### `game_events`
- All blockchain events for historical tracking
- Used for analytics and debugging
- Prevents duplicate processing

#### `leaderboard_cache`
- Pre-computed leaderboards for fast queries
- Updated automatically via background jobs
- Supports daily, weekly, and all-time rankings

### Views

#### `daily_leaderboard`
- Real-time daily rankings
- Includes usernames and avatars
- Sorted by toppings and entries

#### `weekly_leaderboard`
- Real-time weekly rankings
- Same structure as daily leaderboard

## 🔧 API Endpoints

### User Profiles

**GET /api/profiles?walletAddress=0x...**
```json
{
  "profile": {
    "id": "uuid",
    "wallet_address": "0x...",
    "username": "pizza_lover",
    "avatar_url": "https://...",
    "bio": "Love playing Pizza Party!",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "last_active_at": "2024-01-01T00:00:00Z",
    "is_active": true
  },
  "stats": {
    "total_toppings": 150,
    "daily_entries": 7,
    "weekly_entries": 1,
    "referrals_count": 3,
    "vmf_balance": "1000000000000000000000"
  }
}
```

**POST /api/profiles**
```json
{
  "walletAddress": "0x...",
  "username": "pizza_lover",
  "avatar_url": "https://...",
  "bio": "Love playing Pizza Party!"
}
```

### Leaderboards

**GET /api/leaderboard?type=daily&limit=50**
```json
{
  "type": "daily",
  "leaderboard": [
    {
      "rank": 1,
      "wallet_address": "0x...",
      "username": "pizza_king",
      "avatar_url": "https://...",
      "total_toppings": 500,
      "entries_count": 7,
      "referrals_count": 5,
      "vmf_balance": "1000000000000000000000",
      "last_updated": "2024-01-01T00:00:00Z"
    }
  ],
  "stats": {
    "total_players": 1000,
    "total_toppings": 50000,
    "avg_toppings_per_player": 50,
    "top_player_toppings": 500
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🎧 Blockchain Listener

The blockchain listener automatically:
- Monitors contract events in real-time
- Syncs events to the database
- Updates player statistics
- Maintains leaderboard cache

### Start Listener
```bash
node scripts/start-listener.js
```

### Events Monitored
- `PlayerEntered` - New game entries
- `JackpotUpdated` - Jackpot changes
- `ToppingsAwarded` - Topping rewards
- `DailyWinnersSelected` - Daily winners
- `WeeklyWinnersSelected` - Weekly winners
- `PlayerBlacklisted` - Player bans
- `ReferralRegistered` - Referral relationships

## 🔄 Background Jobs

### Leaderboard Cache Updates
```bash
# Update daily leaderboard cache
curl -X POST /api/leaderboard \
  -H "Content-Type: application/json" \
  -d '{"type": "daily"}'

# Update weekly leaderboard cache
curl -X POST /api/leaderboard \
  -H "Content-Type: application/json" \
  -d '{"type": "weekly"}'
```

### Cron Jobs (Recommended)
Set up cron jobs to update leaderboard cache:

```bash
# Update daily leaderboard every hour
0 * * * * curl -X POST http://localhost:3000/api/leaderboard -H "Content-Type: application/json" -d '{"type": "daily"}'

# Update weekly leaderboard every 6 hours
0 */6 * * * curl -X POST http://localhost:3000/api/leaderboard -H "Content-Type: application/json" -d '{"type": "weekly"}'
```

## 🛠️ Development

### Reset Database
```bash
# Drop and recreate database
dropdb pizza_party
createdb pizza_party
node scripts/setup-database.js
```

### View Data
```bash
# Connect to database
psql pizza_party

# View recent events
SELECT * FROM game_events ORDER BY processed_at DESC LIMIT 10;

# View top players
SELECT * FROM daily_leaderboard LIMIT 10;

# View user profiles
SELECT * FROM users LIMIT 10;
```

### Monitor Listener
```bash
# Check listener logs
tail -f logs/blockchain-listener.log

# Check database connections
SELECT * FROM pg_stat_activity WHERE datname = 'pizza_party';
```

## 🚀 Production Deployment

### 1. Database Setup
```bash
# Use managed PostgreSQL service (recommended)
# - AWS RDS
# - Google Cloud SQL
# - DigitalOcean Managed Databases
# - Supabase
```

### 2. Environment Variables
```env
NODE_ENV=production
DB_HOST=your-production-host
DB_PORT=5432
DB_NAME=pizza_party
DB_USER=production_user
DB_PASSWORD=secure_password
DB_SSL=true
```

### 3. Process Management
Use PM2 or similar:
```bash
npm install -g pm2
pm2 start scripts/start-listener.js --name "pizza-party-listener"
pm2 save
pm2 startup
```

### 4. Monitoring
- Set up database monitoring
- Monitor blockchain listener logs
- Set up alerts for failed events
- Regular database backups

## 🔍 Troubleshooting

### Connection Issues
```bash
# Test database connection
node -e "require('./database/config').testConnection()"

# Check PostgreSQL status
sudo systemctl status postgresql
```

### Listener Issues
```bash
# Check blockchain connection
curl -X POST https://mainnet.base.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check contract events
node scripts/test-contract-detailed.js
```

### Performance Issues
```bash
# Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 📈 Performance Benefits

### Before Database
- Leaderboard: 10+ seconds (multiple RPC calls)
- User profiles: Not available
- Historical data: Not available
- Analytics: Not available

### After Database
- Leaderboard: <100ms (cached queries)
- User profiles: <50ms (direct queries)
- Historical data: Available
- Analytics: Available

## 🎯 Next Steps

1. **Set up production database**
2. **Configure monitoring and alerts**
3. **Set up automated backups**
4. **Implement user profile UI**
5. **Add achievement system**
6. **Create analytics dashboard**
