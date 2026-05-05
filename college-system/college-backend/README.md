---
title: College Management Backend
emoji: 🎓
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
app_port: 7860
---

# College Management System — Backend API

Node.js + Express + Prisma 6 REST API.

**Base path:** `/api/v1`

## Required Secrets (set in Space Settings → Variables and secrets)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (e.g. from Supabase/Neon) |
| `JWT_SECRET` | Access token secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `JWT_ACCESS_EXPIRES` | e.g. `15m` |
| `JWT_REFRESH_EXPIRES` | e.g. `7d` |
| `ALLOWED_ORIGINS` | Comma-separated frontend URLs |

Optional (file uploads, email, WhatsApp, Google Drive):

| Variable | Description |
|---|---|
| `UPLOAD_DIR` | Path for uploaded files (use `/tmp/uploads` on HF) |
| `MAX_FILE_SIZE_MB` | Defaults to 5 |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Gmail SMTP |
| `META_WHATSAPP_ENABLED` / `META_WHATSAPP_TOKEN` / `META_WHATSAPP_PHONE_NUMBER_ID` | WhatsApp |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | Drive backup |
