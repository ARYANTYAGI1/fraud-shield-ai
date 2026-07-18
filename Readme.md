# 🛡️ Fraud Shield AI

> **AI-Powered Cybersecurity Fraud Detection Platform**  
> Detect scams, phishing, impersonation, and financial fraud from emails, SMS, URLs, images, PDFs, and voice — in real-time.

[![Node.js](https://img.shields.io/badge/Node.js-24.x-green)](https://nodejs.org) [![Next.js](https://img.shields.io/badge/Next.js-16.x-black)](https://nextjs.org) [![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)](https://www.mongodb.com) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)

---

## 📸 Overview

Fraud Shield AI is a production-ready, full-stack cybersecurity platform with:

- 🤖 **AI Analysis** using Google Gemini or OpenAI GPT-4o
- 🔍 **Multi-modal scanning**: Text, URL, Image (OCR), PDF, Voice
- 📊 **Analytics Dashboard** with 7-day risk trend charts
- 🗂️ **Searchable scan history** with pagination
- 🤝 **AI Fraud Chatbot** for conversational threat analysis
- 🔐 **JWT Authentication** with refresh tokens, email verification, password reset
- 🛡️ **Admin Console** for user and scan management
- 🐳 **Docker** composition for local MongoDB and Redis
- 📈 **Recharts** analytics visualizations
- 🌊 **Framer Motion** animations throughout

---

## 🏗️ Architecture

```
fraud-shield-ai/
├── backend/               # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/        # db.ts, logger.ts, ai.ts
│   │   ├── controllers/   # auth, scan, dashboard, profile, admin
│   │   ├── middlewares/   # auth, error, rate limiting
│   │   ├── models/        # User, Scan, AuditLog
│   │   ├── routes/        # index.ts (all routes mapped)
│   │   ├── services/      # aiService.ts, ocrService.ts, pdfService.ts
│   │   ├── validators/    # authValidator.ts, scanValidator.ts (Zod)
│   │   └── scripts/       # seed.ts (sample data)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/              # Next.js 16 + Tailwind CSS + TypeScript
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── login/            # Login
│   │   │   ├── register/         # Register
│   │   │   ├── forgot-password/  # Password recovery
│   │   │   ├── verify-email/     # Email verification
│   │   │   ├── dashboard/        # Analytics dashboard
│   │   │   ├── scanner/          # Multi-modal scanner
│   │   │   ├── history/          # Scan history
│   │   │   ├── chatbot/          # AI fraud assistant
│   │   │   └── admin/            # Admin console
│   │   ├── components/    # CyberNavigation
│   │   ├── context/       # AuthContext.tsx
│   │   └── utils/         # api.ts (Axios client)
│   └── package.json
│
└── docker-compose.yml     # MongoDB (27018) + Redis (6380)
```

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ / npm
- Docker Desktop (for local DB)

### 2. Start Databases (Docker)

```bash
docker compose up -d
```
This starts:
- **MongoDB** on port `27018`
- **Redis** on port `6380`

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY or OPENAI_API_KEY
npm install
npm run seed          # Seeds test user accounts and scan history
npm run dev           # Starts Express API on http://localhost:5000
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev           # Starts Next.js on http://localhost:3000
```

Open **http://localhost:3000** (or whichever port Next.js uses)

---

## 🔑 Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27018/fraud-shield
JWT_SECRET=super_secret_session_jwt_key_123!
JWT_REFRESH_SECRET=super_secret_refresh_jwt_key_456!
GEMINI_API_KEY=your_google_gemini_api_key_here   # Optional but recommended
OPENAI_API_KEY=your_openai_api_key_here           # Fallback if Gemini not set
REDIS_URL=redis://localhost:6380
NODE_ENV=development
```

**AI Priority**: Gemini → OpenAI → Local heuristic fallback (works without keys for testing!)

---

## 👤 Test Accounts

After running `npm run seed`:

| Role  | Email | Password |
|-------|-------|----------|
| User  | user@fraudshield.ai | UserPass123! |
| Admin | admin@fraudshield.ai | AdminPass123! |

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/refresh` | Refresh access token |
| GET  | `/auth/verify?token=` | Verify email address |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Submit new password |

### Scanning
| Method | Endpoint | Body / Form | Description |
|--------|----------|-------------|-------------|
| POST | `/scan/text` | `{ text }` | Analyze text/SMS/email |
| POST | `/scan/url` | `{ url }` | Analyze suspicious URL |
| POST | `/scan/image` | `FormData: image` | OCR + AI scan |
| POST | `/scan/pdf` | `FormData: pdf` | PDF parse + AI scan |

### Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | User stats, trends, recent scans |
| GET | `/history` | Paginated scan history (supports `?search=&scanType=&category=`) |
| GET | `/profile` | Current user profile |

### Admin (role: admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Global platform statistics |
| GET | `/admin/users` | Paginated user list |
| GET | `/admin/scans` | All scans across users |
| DELETE | `/admin/scans/:id` | Remove a scan record |

---

## 🤖 AI Response Format

Every scan returns a standardized JSON result:

```json
{
  "riskScore": 85,
  "category": "High Risk Scam",
  "confidence": 94,
  "reasons": [
    "Uses urgency language to bypass critical thinking",
    "Requests OTP sharing which banks never ask for",
    "References blocked account without verification"
  ],
  "recommendation": "Do not respond, call, or click any links. Contact your bank via official channels.",
  "redFlags": [
    "OTP Request",
    "Account Blocking Threat",
    "Urgency Language"
  ]
}
```

### Supported Scam Categories
Lottery Scams • Bank Impersonation • OTP Theft • UPI/QR Scams • Investment Fraud • Crypto Scams • Job Scams • Loan Fraud • KYC Scams • Gift Card Scams • Romance Scams • Parcel Scams • Government Impersonation • Identity Theft • Phishing URLs • Typosquatting

---

## 🐳 Docker Compose

```yaml
services:
  mongodb:
    image: mongo:6.0
    ports: ["27018:27017"]

  redis:
    image: redis:7.0-alpine
    ports: ["6380:6379"]
```

Run with: `docker compose up -d`  
Stop with: `docker compose down`

---

## 🛠️ Tech Stack

### Backend
| Library | Purpose |
|---------|---------|
| Express.js | HTTP server framework |
| Mongoose | MongoDB ODM |
| JWT | Session tokens + refresh tokens |
| Bcrypt | Password hashing |
| Zod | Input validation schemas |
| Multer | File upload handling |
| Tesseract.js | Image OCR engine |
| pdf-parse | PDF text extraction |
| @google/genai | Google Gemini AI |
| openai | OpenAI GPT integration |
| Winston | Logging |
| Morgan | HTTP request logging |
| Helmet | HTTP security headers |
| express-rate-limit | Rate limiting |

### Frontend
| Library | Purpose |
|---------|---------|
| Next.js 16 | React App Router framework |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations |
| Recharts | Analytics charts |
| Axios | HTTP client with interceptors |
| Lucide React | Icon components |

---

## 🔒 Security Features

- **Helmet** — HTTP security headers
- **CORS** — Cross-origin request policy
- **Rate Limiting** — Auth: 10/hr, Scans: 30/10min, General: 100/15min
- **JWT** — Short-lived access tokens (15min) + long-lived refresh tokens (7d)
- **Bcrypt** — Password hashing with salt
- **Zod** — Request body validation
- **Input Sanitization** — Prevents injection attacks
- **Audit Logging** — Every login, scan, and admin action is logged

---

## 📋 Sample Test Scenarios

Use the **AI Fraud Chatbot** or **Text Scanner** to try these:

```
Scam Text:
"Your SBI account will be suspended within 24 hours. 
 Verify your KYC by clicking: http://sbi-verify-kyc.online"

Safe Text:
"Hello John, looking forward to our meeting tomorrow at 3PM."

High Risk URL:
http://amazon-security-login-update.phishingsite.net

OTP Scam:
"This is SBI Bank. We need to verify your account. 
 Please share the OTP sent to your registered mobile number."
```

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway / Render)
1. Connect your GitHub repo
2. Set environment variables from `.env.example`
3. Set build command: `npm run build`
4. Set start command: `npm start`

### Database (MongoDB Atlas)
1. Create a free M0 cluster on [MongoDB Atlas](https://mongodb.com/atlas)
2. Copy connection string → set as `MONGO_URI` in production env

---

## 📊 Architecture Diagram

```
┌──────────────┐    HTTPS     ┌──────────────────────────────────┐
│   Browser    │◄────────────►│         Next.js Frontend          │
│  (Port 3003) │              │ Pages: Landing, Auth, Dashboard,   │
└──────────────┘              │ Scanner, History, Chatbot, Admin   │
                              └───────────────┬──────────────────┘
                                              │ Axios API Calls
                                              ▼
                              ┌──────────────────────────────────┐
                              │      Express.js Backend (5000)    │
                              │  Routes → Controllers → Services  │
                              │  Auth • Scan • Dashboard • Admin  │
                              └──┬───────────┬────────────────┬──┘
                                 │           │                │
                          ┌──────┘      ┌────┘           ┌───┘
                          ▼             ▼                 ▼
                    ┌──────────┐  ┌──────────┐    ┌──────────────┐
                    │ MongoDB  │  │  Redis   │    │  AI Services  │
                    │ (27018)  │  │ (6380)   │    │ Gemini/OpenAI│
                    └──────────┘  └──────────┘    └──────────────┘
```

---

## 🎯 Hackathon Features

- ✅ Full Authentication Flow (JWT + Refresh + Email Verify + Reset)
- ✅ 4 Scan Modes (Text, URL, Image+OCR, PDF)
- ✅ Voice Scanner (Web Speech API)
- ✅ AI Fraud Chatbot
- ✅ Admin Console with user management
- ✅ Risk Analytics Dashboard
- ✅ Searchable History
- ✅ Dual AI Provider (Gemini + OpenAI)
- ✅ Heuristic Fallback (works without API keys)
- ✅ Docker compose
- ✅ Database seeding script
- ✅ Clean architecture (controllers/services/repositories)
- ✅ Production-ready security (Helmet, Rate limiting, CORS)

---

*Built with ❤️ for hackathon by Fraud Shield AI*
