# ITSoft AI Business Manager

ITSoft AI Business Manager is a full-stack business operations platform for managing customers, appointments, services, orders, billing, reports, and AI-assisted business insights in one interface.

## Overview

The project combines a React frontend with a FastAPI backend and a PostgreSQL database. The app supports an admin login flow, business dashboard analytics, customer records, appointment scheduling, invoicing, order management, AI Q&A for live business data, and a public website for contact and company information.

## Features

- Admin authentication with JWTs and role-based access control
- Dashboard with business KPIs and summaries
- Customer management
- Appointment scheduling and tracking
- Service catalog and pricing
- Order processing and order status monitoring
- Invoice and billing workflows
- Reporting and analytics views
- AI business assistant powered by backend data access
- Public home, pricing, features, about, and contact pages
- Contact message inbox for admin review

## Architecture

- Frontend: React + Vite
- Backend: FastAPI + Python
- Database: PostgreSQL
- Authentication: PBKDF2-based password hashing and JWT tokens
- Deployment: frontend on Vercel or similar static hosting; backend on Render or another Python host

## Frontend Stack

- React 19
- Vite
- CSS modules / custom styles in the project

## Backend Stack

- FastAPI
- Pydantic validation
- PostgreSQL via psycopg
- JWT-based auth
- Python standard library hashing and HMAC validation

## Database

The project uses PostgreSQL for persistent data storage. Core tables include users, customers, appointments, services, orders, invoices, business settings, reports, and contact_messages.

## Authentication

Authentication uses JWT access tokens with PBKDF2 password hashing. Admin-only routes are protected through role checks. The backend reads environment variables for the database and JWT secret values without committing them to source control.

## Local Setup

1. Open a terminal in the project root.
2. Install frontend dependencies:
   npm install
3. Start the frontend with Vite:
   npm run dev
4. Open the local frontend URL shown by Vite. By default, it connects to the deployed Render API, so a local FastAPI server is not required for login or contact form submissions.

VS Code Live Server's "Go Live" command (port 5500) does not run this React/Vite app. Use `npm run dev` and the URL printed by Vite.

To use a local backend instead, create a root `.env.local` file with `VITE_API_BASE_URL=http://127.0.0.1:8000`, then start FastAPI separately. Backend installation and database configuration are only needed when running that local backend.

## Environment Variables

The frontend accepts the public backend URL in `VITE_API_BASE_URL`. It defaults to the deployed Render API (`https://ai-business-manager-2.onrender.com`) in both development and production. The root `.env.example` documents this setting; Vite does not load `.env.example` automatically.

The backend expects the following values, without exposing real secrets in the repo:

- DB_NAME
- DB_USER
- DB_PASSWORD
- DB_HOST
- DB_PORT
- JWT_SECRET_KEY

Example values are shown in backend/.env.example.

## Production Architecture

The production setup should include:

- a PostgreSQL database instance
- a deployed Python backend service
- a frontend deployment pointing at the backend API
- secure environment variables managed by the host platform
- CORS enabled for the deployed frontend origin

## Deployment Overview

- Backend service: Render or similar Python deployment
- Frontend: Vercel or static hosting for the Vite app
- Database: managed PostgreSQL instance
- Secrets: stored in the deployment platform environment, not checked into Git

## Main Modules

- Authentication and admin access
- Dashboard metrics
- Customer management
- Appointment management
- Service catalog
- Orders and invoices
- Reports and insights
- AI business assistant
- Settings
- Contact/public site pages

## Security Notes

- Do not commit .env files or secret values.
- Keep environment variables secure in the deployment platform.
- Rotate any leaked secrets immediately if they appear in a version-controlled history.

## License

This project is intended for internal business use and submission work as configured for this repository.
