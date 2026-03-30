# 🚀 MediFlow Deployment & Production Guide

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Frontend Deployment](#frontend-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Database Deployment](#database-deployment)
6. [SSL/TLS Configuration](#ssltls-configuration)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Disaster Recovery](#backup--disaster-recovery)
10. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] No console errors or warnings
- [ ] Environment variables configured securely
- [ ] Database migrations completed
- [ ] SSL certificates obtained
- [ ] Backup strategy in place
- [ ] Monitoring tools configured
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Error logging configured
- [ ] Performance optimizations applied
- [ ] Documentation updated

---

## Environment Setup

### Production Environment Variables

**Backend** (`server/.env.production`):
```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mediflow?retryWrites=true&w=majority
MONGODB_POOL_SIZE=50

# Authentication
JWT_SECRET=your_very_long_and_secure_secret_key_here_minimum_32_characters
JWT_EXPIRE=7d

# Client Configuration
CLIENT_URL=https://yourdomain.com

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_specific_password
EMAIL_FROM=noreply@yourhospital.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Redis (for caching and queue management)
REDIS_URL=redis://username:password@redis-host:6379/0

# Security
CORS_ORIGIN=https://yourdomain.com
HELMET_CSP=true

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/mediflow/server.log

# API Rate Limiting
RATE_LIMIT_WINDOW=15 # minutes
RATE_LIMIT_MAX_REQUESTS=100 # per window
```

**Frontend** (`client/.env.production`):
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended for Next.js)

1. **Connect your Git repository:**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

2. **Configure project settings:**
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add environment variables:**
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL`

4. **Deploy:**
   ```bash
   vercel deploy --prod
   ```

### Option 2: Netlify

1. **Connect Git repository:**
   - Visit [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your Git repository

2. **Configure build settings:**
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Add environment variables:**
   - Site settings → Build & deploy → Environment
   - Add your environment variables

4. **Deploy:**
   - Deployment happens automatically on `main` branch push

### Option 3: Self-Hosted (AWS, DigitalOcean, etc.)

1. **Build the application:**
   ```bash
   cd client
   npm run build
   ```

2. **Transfer files to server:**
   ```bash
   scp -r .next/ server.txt next.config.ts node_modules/ \
     user@your-server:/var/www/mediflow/
   ```

3. **Install dependencies and run:**
   ```bash
   cd /var/www/mediflow
   npm install
   npm start
   ```

4. **Configure reverse proxy (Nginx):**
   ```nginx
   server {
     listen 443 ssl http2;
     server_name yourdomain.com;

     ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

---

## Backend Deployment

### Option 1: Heroku

1. **Create Heroku app:**
   ```bash
   heroku login
   heroku create mediflow-api
   ```

2. **Add Procfile to backend:**
   ```
   web: node server.js
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set MONGODB_URI=your_mongodb_uri
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### Option 2: Railway

1. **Create Railway account and connect GitHub**

2. **Create new project → Deploy from Git**

3. **Select your repository**

4. **Configure variables in Railway dashboard**

5. **Railway auto-deploys on push**

### Option 3: Self-Hosted (DigitalOcean, AWS EC2)

1. **SSH into your server:**
   ```bash
   ssh root@your-server-ip
   ```

2. **Install Node.js and npm:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install MongoDB (if not using cloud):**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
   sudo add-apt-repository "deb [arch=amd64,arm64] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse"
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Clone repository:**
   ```bash
   git clone your-repo-url
   cd Medi_Flow/server
   ```

5. **Install dependencies:**
   ```bash
   npm install
   ```

6. **Set up PM2 for process management:**
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name "mediflow-api"
   pm2 startup
   pm2 save
   ```

7. **Configure Nginx reverse proxy:**
   ```nginx
   server {
     listen 443 ssl http2;
     server_name api.yourdomain.com;

     ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

     location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }

     # WebSocket support
     proxy_read_timeout 86400;
   }

   # Redirect HTTP to HTTPS
   server {
     listen 80;
     server_name api.yourdomain.com;
     return 301 https://$server_name$request_uri;
   }
   ```

8. **Restart Nginx:**
   ```bash
   sudo systemctl restart nginx
   ```

---

## Database Deployment

### MongoDB Atlas (Cloud)

1. **Create MongoDB Atlas account** at [mongodb.com/cloud](https://mongodb.com/cloud)

2. **Create a new cluster:**
   - Select "Cloud" → "Create"
   - Choose your provider (AWS, Google Cloud, Azure)
   - Select region and tier (M0 is free)

3. **Set up database user:**
   - Security → Database Access
   - Add Database User with strong password

4. **Configure IP whitelist:**
   - Security → Network Access
   - Add IP address (0.0.0.0/0 for development only!)

5. **Get connection string:**
   - Clusters → Connect → Connect with MongoDB Compass
   - Copy connection string and update `MONGODB_URI`

### Self-Hosted MongoDB

1. **Install MongoDB:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install -y mongodb-org

   # macOS
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Enable authentication:**
   ```bash
   mongosh
   use admin
   db.createUser({
     user: "mediflow_user",
     pwd: "secure_password",
     roles: ["root"]
   })
   ```

3. **Configure MongoDB:**
   Edit `/etc/mongod.conf`:
   ```yaml
   security:
     authorization: enabled
   
   replication:
     replSetName: "rs0"
   ```

4. **Start MongoDB:**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. **Create database and collections:**
   ```bash
   mongosh --username mediflow_user --password
   use mediflow
   ```

---

## SSL/TLS Configuration

### Using Let's Encrypt (Free)

1. **Install Certbot:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Obtain certificate:**
   ```bash
   sudo certbot certonly --nginx -d yourdomain.com -d api.yourdomain.com
   ```

3. **Auto-renewal setup:**
   ```bash
   sudo systemctl enable certbot.timer
   sudo systemctl start certbot.timer
   ```

4. **Update Nginx configuration** (see Backend Deployment section)

### Security Headers

Add to Nginx configuration:
```nginx
# Security Headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

---

## Performance Optimization

### Frontend Optimizations

1. **Enable gzip compression in Nginx:**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss;
   gzip_vary on;
   ```

2. **Cache static assets:**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|woff|woff2)$ {
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   ```

3. **Image optimization:**
   - Use WebP format where possible
   - Optimize image sizes
   - Lazy load images

### Backend Optimizations

1. **Database query optimization:**
   ```javascript
   // Good: Use indexes and projection
   User.find({ role: 'doctor' })
     .select('name email department')
     .lean()
     .exec();

   // Bad: Fetching all fields without limit
   User.find({ role: 'doctor' });
   ```

2. **Implement caching:**
   ```javascript
   const redis = require('redis');
   const client = redis.createClient(process.env.REDIS_URL);

   router.get('/doctors', async (req, res) => {
     const cacheKey = 'all-doctors';
     
     // Check cache first
     const cached = await client.get(cacheKey);
     if (cached) {
       return res.json(JSON.parse(cached));
     }

     // Fetch from DB
     const doctors = await Doctor.find();
     
     // Cache for 1 hour
     await client.setEx(cacheKey, 3600, JSON.stringify(doctors));
     
     res.json(doctors);
   });
   ```

3. **Connection pooling:**
   - Set `MONGODB_POOL_SIZE=50`
   - Configure Redis connection pool

4. **Load balancing:**
   ```nginx
   upstream backend {
     server 127.0.0.1:5000;
     server 127.0.0.1:5001;
     server 127.0.0.1:5002;
   }

   server {
     location / {
       proxy_pass http://backend;
     }
   }
   ```

---

## Monitoring & Logging

### Application Monitoring

1. **Install PM2 Monitoring:**
   ```bash
   npm install -g pm2-plus
   pm2 plus
   ```

2. **Health check endpoint:**
   ```javascript
   router.get('/health', (req, res) => {
     res.json({
       status: 'healthy',
       uptime: process.uptime(),
       timestamp: new Date()
     });
   });
   ```

3. **Error tracking (Sentry):**
   ```bash
   npm install @sentry/node
   ```

   ```javascript
   const Sentry = require('@sentry/node');
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV
   });
   ```

### Logging

1. **Configure Winston logger:**
   ```bash
   npm install winston
   ```

   ```javascript
   const winston = require('winston');

   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });

   if (process.env.NODE_ENV !== 'production') {
     logger.add(new winston.transports.Console({
       format: winston.format.simple()
     }));
   }
   ```

---

## Backup & Disaster Recovery

### MongoDB Backups

1. **Automated backups:**
   ```bash
   # Create backup script
   cat > /usr/local/bin/backup-mongodb.sh << 'EOF'
   #!/bin/bash
   BACKUP_DIR="/var/backups/mongodb"
   DB_USER="mediflow_user"
   DB_PASS="secure_password"
   
   mkdir -p $BACKUP_DIR
   
   mongodump \
     --username $DB_USER \
     --password $DB_PASS \
     --out $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)
   
   # Keep last 30 days of backups
   find $BACKUP_DIR -type d -mtime +30 -exec rm -rf {} +
   EOF

   chmod +x /usr/local/bin/backup-mongodb.sh
   ```

2. **Schedule backups with cron:**
   ```bash
   # Daily at 2 AM
   0 2 * * * /usr/local/bin/backup-mongodb.sh
   ```

3. **Restore from backup:**
   ```bash
   mongorestore --username mediflow_user --password /var/backups/mongodb/backup_directory
   ```

### Database Replication

For MongoDB Atlas, enable automatic backups in the cluster settings.

---

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs mediflow-api

# Check port availability
lsof -i :5000

# Check environment variables
env | grep MONGODB
```

### Database Connection Issues
```bash
# Test MongoDB connection
mongosh --uri "mongodb+srv://username:password@cluster.mongodb.net/mediflow"

# Check connection pool
# In logs, look for: "Connected to MongoDB with pool size 50"
```

### WebSocket Connection Failed
- Ensure backend is running
- Check firewall rules
- Verify `NEXT_PUBLIC_SOCKET_URL` is correct
- Check browser console for errors

### High Memory Usage
```bash
# Monitor memory usage
pm2 monit

# Increase Node.js heap size
NODE_OPTIONS="--max-old-space-size=2048" npm start
```

### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem

# Renew certificate
sudo certbot renew --dry-run
```

---

## Production Checklist (Post-Deployment)

- [ ] Application is running and accessible
- [ ] SSL/TLS certificate is valid
- [ ] Database connection is working
- [ ] Email notifications are sending
- [ ] SMS notifications are working
- [ ] WebSocket connections are established
- [ ] Logging is configured and working
- [ ] Monitoring alerts are configured
- [ ] Backup schedule is active
- [ ] Rate limiting is enforced
- [ ] CORS is properly configured
- [ ] Security headers are present
- [ ] Database indexes are created
- [ ] Performance metrics are acceptable
- [ ] Disaster recovery plan is documented

