# TASK: Build an AI-Powered Fraud Detection Platform

## Objective

Build a production-ready full-stack web application that detects scams and fraud from multiple input types using AI.

The system should analyze:

- Email text
- SMS
- WhatsApp messages
- Social media messages
- URLs
- Images (screenshots of chats/emails)
- PDFs
- Documents

The AI should classify whether the content is:

- Safe
- Suspicious
- Fraud
- High Risk Scam

The system should explain WHY.

------------------------------------------------------------

# Tech Stack

Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Socket.io (optional)
- Redis (optional caching)
- OpenAI API (or configurable AI provider)
- OCR (Tesseract)
- VirusTotal URL reputation integration (optional)
- Google Safe Browsing integration (optional)

Frontend

- Next.js (preferred)
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Query
- Axios
- Framer Motion
- Recharts

Deployment

Frontend
- Vercel

Backend
- Railway or Render

Database
- MongoDB Atlas

Storage
- Cloudinary

------------------------------------------------------------

# Authentication

Implement

- Register
- Login
- JWT
- Refresh Token
- Forgot Password
- Email Verification

------------------------------------------------------------

# Dashboard

Beautiful modern dashboard showing

Total scans

Safe

Fraud

Suspicious

Recent scans

Charts

Risk trend

------------------------------------------------------------

# Scan Types

## Text Scanner

Paste

Email

SMS

WhatsApp

Any text

Click Analyze

------------------------------------------------------------

## URL Scanner

Paste URL

Detect

- phishing
- fake login
- suspicious domain
- impersonation
- shortened URLs

------------------------------------------------------------

## Image Scanner

Upload image

OCR extracts text

AI analyzes

Highlight suspicious text

------------------------------------------------------------

## PDF Scanner

Extract text

Analyze

------------------------------------------------------------

# AI Analysis

AI returns

Risk Score (0-100)

Classification

Safe

Suspicious

Fraud

Critical

Confidence

Reasons

Detected Red Flags

Recommended Action

JSON format

{
 riskScore:85,
 category:"Fraud",
 confidence:96,
 reasons:[
  "...",
  "...",
  "..."
 ],
 recommendation:"Do not click links."
}

------------------------------------------------------------

# Scam Detection Rules

Detect

Lottery scams

Bank scams

OTP scams

UPI scams

Fake QR codes

Investment scams

Crypto scams

Job scams

Loan scams

KYC scams

Gift card scams

Romance scams

Parcel scams

Courier scams

Government scams

Identity theft

Urgency language

Threat language

Fake domains

Typosquatting

------------------------------------------------------------

# AI Prompt Engineering

Create centralized prompt templates.

Never hardcode prompts.

Prompt builder should be reusable.

------------------------------------------------------------

# Database

Collections

Users

Scans

Files

AuditLogs

------------------------------------------------------------

# Scan History

Store

input

output

timestamp

risk

scan type

------------------------------------------------------------

# Search

Search previous scans

------------------------------------------------------------

# Export

Download PDF report

------------------------------------------------------------

# Admin Panel

Users

Scans

Statistics

Delete scans

------------------------------------------------------------

# REST APIs

POST /scan/text

POST /scan/url

POST /scan/image

POST /scan/pdf

GET /history

GET /dashboard

GET /profile

------------------------------------------------------------

# AI Service

Create AI service layer.

Support swapping providers.

Current provider:
OpenAI

Future

Gemini

Claude

Groq

------------------------------------------------------------

# Architecture

Use clean architecture

controllers

routes

services

repositories

middlewares

validators

utils

config

------------------------------------------------------------

# Validation

Use Zod

------------------------------------------------------------

# Logging

Morgan

Winston

------------------------------------------------------------

# Security

Helmet

Rate limiting

CORS

XSS protection

Input sanitization

JWT

------------------------------------------------------------

# Environment Variables

Proper .env.example

------------------------------------------------------------

# Docker

Create

Dockerfile

docker-compose.yml

------------------------------------------------------------

# CI/CD

GitHub Actions

Run lint

Run tests

Deploy automatically

------------------------------------------------------------

# Documentation

Generate

README

API docs

Setup guide

Deployment guide

------------------------------------------------------------

# UI Requirements

Professional cybersecurity theme.

Dark mode.

Responsive.

Animations.

Modern cards.

Loading states.

Error states.

------------------------------------------------------------

# Bonus Features

Voice scam analysis

AI chatbot

Browser extension

Email plugin

Chrome extension

Real-time monitoring

------------------------------------------------------------

# Deliverables

The project must be completely working.

No placeholder code.

No TODOs.

No fake APIs.

Proper folder structure.

Production-ready code.

Fully documented.

Deploy frontend and backend.

Generate deployment URLs.

Generate sample test data.

Generate Postman collection.

Generate README.

Generate screenshots.

Generate architecture diagram.

The final project should be hackathon quality and ready for demonstration.



aryantyagi296_db_user

muKGsP3qxkxDxux7