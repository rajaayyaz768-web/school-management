# Deployment Runbook — College Management System

This guide covers provisioning a VPS and deploying the backend. The frontend stays on Vercel.

---

## Prerequisites

- Ubuntu 22.04 VPS (DigitalOcean / Hostinger / Contabo — 2 vCPU, 2 GB RAM minimum)
- A domain pointing to the VPS IP (`college.example.pk` → VPS IP)
- SSH root access

---

## 1. Initial Server Setup

```bash
# Update packages
apt update && apt upgrade -y

# Create a non-root deploy user
adduser deploy
usermod -aG sudo deploy

# Copy your SSH key to the deploy user
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Harden SSH: disable root login (edit /etc/ssh/sshd_config)
# PermitRootLogin no
# PasswordAuthentication no
systemctl restart sshd
```

---

## 2. Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
node -v   # should print v20.x.x
```

---

## 3. Install PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# Create DB + user
sudo -u postgres psql <<EOF
CREATE USER college WITH PASSWORD 'strong-password-here';
CREATE DATABASE college OWNER college;
GRANT ALL PRIVILEGES ON DATABASE college TO college;
EOF
```

---

## 4. Install PM2 (process manager)

```bash
npm install -g pm2
pm2 startup   # follow the printed command to enable on boot
```

---

## 5. Install Nginx + Certbot (SSL)

```bash
apt install -y nginx certbot python3-certbot-nginx
systemctl enable nginx

# Obtain TLS certificate (replace with your domain)
certbot --nginx -d college.example.pk
```

Copy `college-backend/nginx.conf.example` to `/etc/nginx/sites-available/college`, edit the domain, then:

```bash
ln -s /etc/nginx/sites-available/college /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## 6. Deploy the Backend

```bash
# As the deploy user, clone the repo
git clone https://github.com/your-org/college-system.git /opt/college
cd /opt/college/college-system/college-backend

# Create .env from template
cp .env.example .env
nano .env   # fill in DATABASE_URL, JWT secrets, ALLOWED_ORIGINS, etc.

# Install dependencies and build
npm ci
npx prisma migrate deploy
npx prisma generate
npm run build

# Create log directory
sudo mkdir -p /var/log/college
sudo chown deploy:deploy /var/log/college

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
```

---

## 7. Configure Backup Cron Jobs

```bash
# Copy scripts to /opt/college/scripts
cp /opt/college/scripts/backup-*.sh /opt/college/scripts/
chmod +x /opt/college/scripts/*.sh

# Create the backup directory
sudo mkdir -p /var/backups/college
sudo chown deploy:deploy /var/backups/college

# Add to crontab (crontab -e as deploy user)
# Daily backup at 02:00
0 2 * * * BACKUP_DIR=/var/backups/college DATABASE_URL=<your_url> /opt/college/scripts/backup-daily.sh >> /var/log/college/backup.log 2>&1

# Weekly off-site upload Sunday 02:15 (requires rclone configured)
15 2 * * 0 BACKUP_DIR=/var/backups/college /opt/college/scripts/backup-weekly.sh >> /var/log/college/backup.log 2>&1

# Monthly archive on 1st of month 02:30
30 2 1 * * BACKUP_DIR=/var/backups/college /opt/college/scripts/backup-monthly.sh >> /var/log/college/backup.log 2>&1
```

---

## 8. Frontend (Vercel — no changes needed)

The frontend is already deployed on Vercel. Only update the environment variable:

```
NEXT_PUBLIC_API_URL=https://college.example.pk/api/v1
```

---

## 9. Verify the Deployment

```bash
# Health check
curl -I https://college.example.pk/health
# Expect: HTTP/2 200, Strict-Transport-Security header present

# Check PM2 cluster
pm2 status
pm2 logs college-backend --lines 50

# Test rate limiting (should block only the requesting IP, not all clients)
for i in $(seq 1 200); do curl -s -o /dev/null https://college.example.pk/api/v1/auth/login; done
# The VPS IP should get 429, other IPs still work
```

---

## 10. Restore from Backup

```bash
# List available backups
ls -lh /var/backups/college/

# Restore (interactive — confirms before dropping DB)
DATABASE_URL="postgres://college:password@localhost:5432/college" \
  /opt/college/scripts/restore.sh /var/backups/college/backup_2026-04-09_020001.sql.gz
```

---

## Maintenance

| Task | Command |
|------|---------|
| Deploy new backend version | `git pull && npm ci && npm run build && pm2 reload college-backend` |
| View live logs | `pm2 logs college-backend` |
| Renew SSL cert | `certbot renew` (auto via systemd timer) |
| Check backup status | Open `/principal/settings/backups` in the app |
