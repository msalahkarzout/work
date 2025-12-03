# Invoice Pro - Deployment Guide

This guide explains how to deploy Invoice Pro for free using the Mixed deployment approach.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│    Database     │
│    (Vercel)     │     │    (Render)     │     │     (Neon)      │
│   React App     │     │  Spring Boot    │     │   PostgreSQL    │
│     FREE        │     │     FREE        │     │      FREE       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Step 1: Setup Database (Neon - Free PostgreSQL)

### 1.1 Create Neon Account
1. Go to https://neon.tech
2. Sign up with GitHub or email
3. Create a new project named "invoice-pro"

### 1.2 Get Connection Details
After creating the project, you'll get:
- Host: `ep-xxxxx.region.aws.neon.tech`
- Database: `neondb`
- Username: `your-username`
- Password: `your-password`

### 1.3 Configure Connection String
Your JDBC URL will be:
```
jdbc:postgresql://ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
```

---

## Step 2: Deploy Backend (Render - Free)

### 2.1 Prepare Your Code
Make sure your code is pushed to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/invoice-pro.git
git push -u origin main
```

### 2.2 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### 2.3 Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `invoice-pro-api`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: ` ` (leave empty)
   - **Runtime**: `Docker` or `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`

### 2.4 Set Environment Variables
Add these in the Render dashboard under "Environment":

| Variable | Value |
|----------|-------|
| `PORT` | `8080` |
| `DATABASE_URL` | `jdbc:postgresql://ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require` |
| `DATABASE_USERNAME` | `your-neon-username` |
| `DATABASE_PASSWORD` | `your-neon-password` |
| `JWT_SECRET` | `your-super-secret-jwt-key-make-it-long-and-random-at-least-64-characters` |
| `CORS_ORIGINS` | `https://your-app.vercel.app` |

### 2.5 Deploy
Click "Create Web Service" and wait for deployment (5-10 minutes first time).

Your API will be available at: `https://invoice-pro-api.onrender.com`

**Note**: Free tier sleeps after 15 minutes of inactivity. First request may take 30-60 seconds.

---

## Step 3: Deploy Frontend (Vercel - Free)

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

### 3.2 Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 3.3 Set Environment Variables
Add in Vercel dashboard under "Environment Variables":

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://invoice-pro-api.onrender.com/api/` |

**Important**: Include the trailing slash `/` at the end!

### 3.4 Deploy
Click "Deploy" and wait (2-3 minutes).

Your app will be available at: `https://your-app.vercel.app`

---

## Step 4: Update CORS (Important!)

After deploying frontend, go back to Render and update:
```
CORS_ORIGINS=https://your-app.vercel.app
```

This allows your frontend to communicate with the backend.

---

## Alternative: Deploy on Railway

Railway offers a similar free tier with slightly better performance.

### Railway Setup
1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Add environment variables (same as Render)
5. Railway auto-detects Spring Boot and deploys

---

## Quick Reference

### Environment Variables Summary

**Backend (Render/Railway)**:
```env
PORT=8080
DATABASE_URL=jdbc:postgresql://your-host/your-db?sslmode=require
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
JWT_SECRET=your-64-character-secret-key
CORS_ORIGINS=https://your-frontend-url.vercel.app
```

**Frontend (Vercel)**:
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com/api/
```

---

## Troubleshooting

### Backend won't start
- Check logs in Render/Railway dashboard
- Verify DATABASE_URL format includes `?sslmode=require` for Neon
- Ensure JWT_SECRET is set

### CORS errors in browser
- Verify CORS_ORIGINS matches exactly your Vercel URL
- Include `https://` prefix
- No trailing slash for CORS_ORIGINS

### Database connection failed
- Neon databases sleep after 5 minutes of inactivity (free tier)
- First connection may take a few seconds to "wake up"
- Verify username/password are correct

### Slow first request
- Free tier services sleep when inactive
- First request "wakes up" the service (30-60 seconds)
- Subsequent requests are fast

---

## Free Tier Limits

| Service | Free Limits |
|---------|-------------|
| **Neon** | 0.5 GB storage, 3 GB data transfer/month |
| **Render** | 750 hours/month, sleeps after 15 min inactivity |
| **Vercel** | 100 GB bandwidth, unlimited deployments |
| **Railway** | $5 credit/month, ~500 hours runtime |

---

## Production Checklist

- [ ] Database created on Neon
- [ ] Backend deployed on Render/Railway
- [ ] Environment variables configured
- [ ] Frontend deployed on Vercel
- [ ] CORS_ORIGINS updated with Vercel URL
- [ ] Test login functionality
- [ ] Test all CRUD operations
- [ ] Share URL with clients for testing

---

## Support

For issues with this deployment, check:
- Render logs: Dashboard → Your Service → Logs
- Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
- Neon: Dashboard → Project → Connection Details
