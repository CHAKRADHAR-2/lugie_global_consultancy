# LUGIE — Overseas Education Platform Deployment Guide

> **Lugie Global Consultancy**  
> *"Dream Beyond Borders"*  
> Transparent, Non-Negotiable Pricing for Global Admissions.

This guide outlines how to deploy the LUGIE platform in production using Docker Compose or standalone container runtimes.

---

## 1. Architecture Overview

- **Frontend**: Next.js 16 (React 19, Tailwind CSS v4, Lucide Icons), standalone Node.js server.
- **Backend API**: FastAPI (Python 3.12, SQLAlchemy 2 Async, Alembic, SlowAPI rate-limiting).
- **Relational Database**: PostgreSQL 16 (34 tables, foreign keys, cascade deletes, audit logs).
- **Cache & Rate-Limiter**: Redis 7.2.
- **Object Storage**: MinIO / AWS S3 (private dossier buckets & quarantined uploads).
- **Payment Gateway**: Dual-mode sandbox simulation active by default; zero-code live gateway switch via environment variables.

---

## 2. Production Portals & Default Credentials

| Portal | URL Path | Role | Default Login (Dev/Demo) |
|---|---|---|---|
| **Public Site** | `/` | Visitor / Prospective Student | N/A |
| **Student Portal** | `/student/dashboard` | Student Candidate | Register via `/register` or login |
| **Counsellor Portal** | `/counsellor/dashboard` | Assigned Advisor | `counsellor@lugie.com` / `Counsellor123!` |
| **Admin Portal** | `/admin/dashboard` | Super Admin / Agency Lead | `admin@lugie.com` / `Admin123!` |

---

## 3. Quick Start (Production Docker Compose)

### Step 1: Clone and Configure Environment
```bash
cp .env.production.sample .env.production
# Edit .env.production with your secure database password and JWT secret key:
nano .env.production
```

### Step 2: Build and Start Containers
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### Step 3: Run Database Migrations & Initial Seeds
```bash
# Run database migrations
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Run initial seed script (roles, permissions, pricing packages, universities)
docker compose -f docker-compose.prod.yml exec backend python scripts/seed_data.py
```

### Step 4: Verify Health
```bash
# Backend healthcheck
curl -f http://localhost:8000/healthz

# Frontend healthcheck
curl -I http://localhost:3000/
```

---

## 4. Payment Gateway: Dual Sandbox (Razorpay & Stripe)

The platform currently operates in **Dual-Gateway Sandbox Mode**:
1. Students can choose between **Basic (₹7,999)**, **Standard (₹13,999)**, and **Premium (₹24,999)**.
2. Students can select between two premier payment gateways:
   * 🇮🇳 **Razorpay**: For Indian students paying via UPI (GPay, PhonePe, Paytm, BHIM), RuPay, NetBanking, and Indian cards.
   * 🌐 **Stripe**: For International / NRI students paying via International Credit Cards (Visa, MasterCard, Amex), Apple Pay, and Google Pay.
3. The platform generates an official transaction reference (`LUGIE-PAY-RZP-...` or `LUGIE-PAY-STP-...`), updates their enrolled tier, and issues an official tax invoice dispatched to their registered email address via Brevo.
4. The Admin portal tracks all gross revenue and itemized ledgers in `/admin/payments` and `/admin/reports`.

### Activating Live Payments (When Ready to Invest):
1. Obtain live merchant keys from **Razorpay** (`rzp_live_...`) when switching from test keys (`rzp_test_...`) and/or **Stripe** (`sk_live_...`).
2. Add them to `.env.production`:
   ```env
   # Razorpay (India)
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

   # Stripe (Global) — Optional / Later
   STRIPE_API_KEY=sk_live_xxxxxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
   ```
3. Restart the backend container:
   ```bash
   docker compose -f docker-compose.prod.yml restart backend
   ```
4. **No frontend code changes or rebuilds are required.**

---

## 5. Email (Brevo) & Mobile OTP (Firebase Phone Auth) Setup

### A. Brevo Email Relay (Configured & Active)
1. Free Brevo account (300 free emails/day = 9,000/month).
2. Connected with live Brevo API key:
   ```env
   EMAIL_PROVIDER=brevo
   BREVO_API_KEY=<YOUR_BREVO_API_KEY>
   BREVO_FROM_EMAIL=your-verified-sender@example.com
   BREVO_FROM_NAME=Lugie Global Consultancy
   ```

### B. Firebase Phone Auth (Configured & Active)
1. Connected with Firebase project `lugie-global-consultancy`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=<YOUR_FIREBASE_WEB_API_KEY>
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lugie-global-consultancy.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=lugie-global-consultancy
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lugie-global-consultancy.appspot.com
   ```
2. Note: Ensure `localhost` and your production domain are added under Firebase Console → Authentication → Settings → **Authorized domains**.

---

## 6. Firebase Hosting & Google Cloud Deployment

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Initialize project:
   ```bash
   cp .firebaserc.sample .firebaserc
   # Replace your-firebase-project-id with your real Firebase Project ID
   ```
3. Deploy frontend and backend containers:
   ```bash
   # Deploy Next.js to Firebase Hosting + Cloud Run
   firebase deploy --only hosting
   ```


---

## 5. Security & Maintenance

- **CORS**: Ensure `CORS_ORIGINS` in `.env.production` contains only your production domains.
- **JWT Secret**: Use a cryptographically secure 64-character random string (`openssl rand -hex 32`).
- **SSL / TLS**: Place Nginx or Cloudflare in front of port 3000 (frontend) and port 8000 (backend API) with HTTP/2 and HTTPS redirection.
