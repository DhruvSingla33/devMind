# Enterprise Aarambh Backend API Service 🚀

An enterprise-ready, production-grade Node.js REST API service for **Aarambh** — an advanced exam preparation platform for NEET, JEE, and Board exams (supporting React Native Web & Mobile app clients and Admin CMS dashboards).

---

## 📋 Table of Contents
- [🌟 Key Architectural Highlights](#-key-architectural-highlights)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Directory Structure](#-project-directory-structure)
- [🚀 Quick Start Guide (Step-by-Step)](#-quick-start-guide-step-by-step)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Local Setup](#2-local-setup)
  - [3. Running via Docker](#3-running-via-docker-recommended-for-prod-parity)
- [🔑 Default Seed Accounts & Database Seeding](#-default-seed-accounts--database-seeding)
- [⚙️ Environment Variables Reference](#️-environment-variables-reference)
- [📖 API Endpoint Directory & Swagger Docs](#-api-endpoint-directory--swagger-docs)
  - [📱 Client APIs (`/api/v1/client/*`)](#-client-apis-apiv1client)
  - [🛠️ Admin CMS APIs (`/api/v1/admin/*`)](#️-admin-cms-apis-apiv1admin)
- [☁️ AWS CloudWatch Logging & Security](#️-aws-cloudwatch-logging--security)
- [🐳 Production Deployment (AWS EC2 / ECS)](#-production-deployment-aws-ec2--ecs)

---

## 🌟 Key Architectural Highlights

1. **Sectioned Route Architecture**:
   - **Client API Section (`/api/v1/client/*`)**: Optimized for React Native Mobile & Web apps with JWT authentication, Redis query caching, and strict data projection.
   - **Admin API Section (`/api/v1/admin/*`)**: Dynamic content administration guarded by `authenticateJWT` + `authorizeRoles('admin')`. Enables live addition/modification of Textbooks, NCERT PDFs, MCQs/PYQs, CBT Mock Tests, Mentors, and Rank Prediction rules without app redeployment.

2. **Multi-Channel Authentication & Security**:
   - **Phone & Email OTP**: 6-digit cryptographic OTP generation (`POST /api/v1/client/auth/send-otp` & `POST /api/v1/client/auth/verify-otp`) supporting Twilio SMS, Fast2SMS gateway, Nodemailer email delivery, and dev-mode console logging fallback. Features MongoDB 10-minute TTL auto-expiring index.
   - **Email / Password**: Bcrypt password hashing (`cost factor 10`).
   - **Google OAuth 2.0**: Direct backend verification via `google-auth-library`.
   - **JWT Tokens & RBAC**: Configurable token expiration & cryptographic signing (`RS256` / `HS256`). Enforces Role-Based Access Control (`student`, `admin`, `mentor`).
   - **Strict Auth Guard**: Unauthenticated requests to core platform modules return `401 Unauthorized`.

3. **AWS S3 Integration & Cost-Effective NCERT PDF Management**:
   - Presigned upload URLs (`POST /api/v1/upload/presigned-url`) for both images (`image/*`) and NCERT PDF textbooks (`application/pdf`).
   - **Cost Optimization**: Stores binary PDFs in AWS S3 and keeps S3 URL references in MongoDB documents — cutting MongoDB storage costs by up to 90%.

4. **AWS CloudWatch & Winston Audit Logging**:
   - Centralized, structured JSON request logging (`src/middlewares/logging.middleware.js`).
   - Captures client IP, HTTP method, URL path, response time (`ms`), HTTP status code, user ID, and role.
   - Automatically streams log events to AWS CloudWatch Log Group (`/aws/aarambh-backend/api-logs`).

5. **Redis Query Caching & Resiliency (`ioredis`)**:
   - In-memory GET caching for heavy content endpoints (Textbooks, NCERT Chapter Lists, Mentors, Daily Pulse).
   - Automatic cache pattern invalidation upon Admin mutations.
   - Transparent fallback to MongoDB if Redis is offline.
   - **Database Connection Safety**: `bufferCommands: false` configured in Mongoose to immediately return `503 Service Unavailable` if MongoDB is down, avoiding API request hangs.

6. **Rate Limiting & Security Headers**:
   - Global rate limiter via `express-rate-limit` (100 requests per 15-min window).
   - Strict rate limiter on Auth & OTP routes (10 requests per 15-min window).
   - `helmet` security headers & CORS policy.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (`v18+` ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB (`v7.0+`) with Mongoose ODM
- **Caching**: Redis with `ioredis`
- **Validation**: Joi (Environment & Payload schemas)
- **Auth**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, Google OAuth 2.0 (`google-auth-library`)
- **Cloud & Media**: AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
- **Logging**: Winston + AWS CloudWatch (`winston-cloudwatch`)
- **Documentation**: Swagger UI (`swagger-ui-express`, `swagger-jsdoc`)
- **Containerization**: Docker & Docker Compose

---

## 📁 Project Directory Structure

```text
Aarambh-Backend/
├── .env.example                # Template for environment configuration
├── .dockerignore               # Files excluded from Docker builds
├── Dockerfile                  # Production-ready Docker container file
├── docker-compose.yml          # One-command full stack launcher (App, Mongo, Redis)
├── package.json                # Project dependencies and npm scripts
├── README.md                   # Full system documentation
└── src/
    ├── server.js               # Express application entrypoint & database bootstrap
    ├── config/
    │   ├── db.js               # MongoDB Mongoose connection manager & health checks
    │   ├── env.config.js       # Joi environment validation & export
    │   ├── redis.js            # Redis client initialization & fallback handling
    │   └── swagger.config.js   # OpenAPI 3.0 documentation specs
    ├── constants/
    │   └── app.constants.js    # Centralized HTTP status codes, messages, roles & TTLs
    ├── controllers/
    │   ├── admin.controller.js # Admin CMS controllers
    │   ├── auth.controller.js  # Auth (Email, Phone OTP, Google OAuth) controllers
    │   ├── client.controller.js# Client feature controllers (Tests, Arena, Mentors, etc.)
    │   └── upload.controller.js# AWS S3 Presigned URL generator controller
    ├── middlewares/
    │   ├── auth.middleware.js  # JWT validation & RBAC authorization guards
    │   ├── cache.middleware.js # Redis query caching middleware
    │   ├── error.middleware.js # Global error handler
    │   ├── logging.middleware.js# CloudWatch & Winston audit request logger
    │   ├── rateLimiter.middleware.js # Rate limiters
    │   └── validate.middleware.js  # Joi schema validation middleware
    ├── models/
    │   ├── mentor.model.js     # AIIMS/IIT Ranker Mentor schema
    │   ├── otp.model.js        # Phone/Email OTP schema (10-min TTL index)
    │   ├── pulse.model.js      # Daily Memory Workout schema
    │   ├── question.model.js   # MCQ & PYQ Question Bank schema
    │   ├── test.model.js       # CBT Mock Test schema
    │   ├── textbook.model.js   # NCERT Textbook & S3 PDF URL schema
    │   └── user.model.js       # User account & role schema
    ├── routes/
    │   ├── admin/              # Guarded Admin CMS routes (/api/v1/admin/*)
    │   └── client/             # Mobile/Web Client routes (/api/v1/client/*)
    ├── seeders/
    │   └── aarambh.seeder.js   # Automated DB seeder script & startup auto-seed logic
    ├── services/
    │   ├── jwt.service.js      # JWT signing & verification logic
    │   ├── otp.service.js      # OTP generation & SMS/Email gateway router
    │   └── s3.service.js       # AWS S3 presigned URL generator & asset retriever
    └── utils/
        ├── logger.js           # Winston + CloudWatch logger initialization
        └── responseMapper.js   # Standardized API response formatters
```

---

## 🚀 Quick Start Guide (Step-by-Step)

If anyone needs to set up and run this project locally, follow these steps:

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **MongoDB**: Community Edition v7.0+ ([Installation Guide](https://www.mongodb.com/docs/manual/administration/install-community/))
  - *macOS*: `brew install mongodb-community@7.0 && brew services start mongodb-community@7.0`
- **Redis** (Optional, recommended for caching):
  - *macOS*: `brew install redis && brew services start redis`
- **Docker & Docker Compose** (Optional, for containerized run)

---

### 2. Local Setup

#### Step 1: Clone & Install Dependencies
```bash
cd Aarambh-Backend
npm install
```

#### Step 2: Configure Environment File
Create `.env` file by copying `.env.example`:
```bash
cp .env.example .env
```
*(In development, default values in `.env.example` will work out of the box with local MongoDB and console OTP logging).*

#### Step 3: Run Database Seeder
To seed the database with initial Admin accounts, Student accounts, NCERT Textbooks, Question Banks, CBT Mock Tests, and AIIMS Ranker Mentors:
```bash
npm run seed
```
> **Note**: The application also features **Auto-Seeding on Startup**. If MongoDB is connected and empty, the server automatically populates initial seed data upon start!

#### Step 4: Start Development Server
```bash
npm run dev
```
The server will start on **`http://localhost:5000`**.

---

### 3. Running via Docker (Recommended for Prod Parity)

Launch Node.js app, MongoDB, and Redis with a single command:
```bash
# Copy env configuration
cp .env.example .env

# Build and start containers in background
docker-compose up -d --build
```
- App Server: `http://localhost:5000`
- MongoDB Container: `localhost:27017`
- Redis Container: `localhost:6379`

To view logs:
```bash
docker-compose logs -f app
```

---

## 🔑 Default Seed Accounts & Database Seeding

Running `npm run seed` or starting the app creates these ready-to-use accounts:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@aarambh.in` | `admin123Password!` | Full access to `/api/v1/admin/*` and CMS content management |
| **Student** | `student@aarambh.in` | `student123Password!` | Access to `/api/v1/client/*` learning & practice modules |

---

## ⚙️ Environment Variables Reference

| Variable Name | Default / Sample | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port on which Express server listens |
| `NODE_ENV` | `development` | Environment mode (`development`, `production`, `test`) |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/aarambh_db` | MongoDB connection string |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis cache connection string |
| `JWT_SECRET` | `supersecretjwtkey_change_in_production...` | Secret key for JWT signing |
| `JWT_ACCESS_EXPIRATION` | `1d` | Token validity duration |
| `GOOGLE_CLIENT_ID` | `your-google-client-id...` | Google OAuth Client ID for identity verification |
| `TWILIO_ACCOUNT_SID` | `your_twilio_account_sid` | Twilio SID for real SMS OTP delivery |
| `TWILIO_AUTH_TOKEN` | `your_twilio_auth_token` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | `+1234567890` | Sender phone number for Twilio SMS |
| `FAST2SMS_API_KEY` | `your_fast2sms_api_key` | Fast2SMS API key (Indian SMS gateway option) |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP Server Host for Email OTPs |
| `SMTP_PORT` | `587` | SMTP Port |
| `SMTP_USER` | `your_email@gmail.com` | Email account for sending verification emails |
| `SMTP_PASS` | `your_app_password` | Email app password |
| `AWS_REGION` | `ap-south-1` | AWS S3 & CloudWatch region |
| `AWS_ACCESS_KEY_ID` | `your_aws_access_key` | AWS IAM Access Key |
| `AWS_SECRET_ACCESS_KEY` | `your_aws_secret_key` | AWS IAM Secret Key |
| `AWS_S3_BUCKET_NAME` | `aarambh-media-assets` | AWS S3 Bucket Name for images & NCERT PDFs |
| `CLOUDWATCH_LOG_GROUP_NAME` | `/aws/aarambh-backend/api-logs` | AWS CloudWatch Log Group for audit logs |

---

## 📖 API Endpoint Directory & Swagger Docs

Interactive Swagger UI documentation is available live at:
👉 **`http://localhost:5000/api-docs`**

### 📱 Client APIs (`/api/v1/client/*`)

| Module | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :---: | :--- |
| **Auth** | `POST` | `/api/v1/client/auth/signup` | ❌ | Email/Password Registration |
| **Auth** | `POST` | `/api/v1/client/auth/login` | ❌ | Email/Password Login |
| **Auth** | `POST` | `/api/v1/client/auth/send-otp` | ❌ | Send 6-digit Phone/Email OTP |
| **Auth** | `POST` | `/api/v1/client/auth/verify-otp` | ❌ | Verify OTP & Register/Login |
| **Auth** | `POST` | `/api/v1/client/auth/google` | ❌ | Google OAuth ID Token Auth |
| **Textbooks** | `GET` | `/api/v1/client/textbooks` | 🔒 | List NCERT Textbooks & PDF links (Cached) |
| **Textbooks** | `GET` | `/api/v1/client/textbooks/:code` | 🔒 | Get textbook chapters & S3 PDF URLs |
| **Questions** | `GET` | `/api/v1/client/questions` | 🔒 | MCQ Question Bank & PYQ search |
| **Questions** | `POST` | `/api/v1/client/questions/submit-answer` | 🔒 | Verify answer & get step-by-step explanation |
| **Tests** | `GET` | `/api/v1/client/tests` | 🔒 | List CBT Mock Tests |
| **Tests** | `POST` | `/api/v1/client/tests/create-mix-quiz` | 🔒 | Generate dynamic custom Mix Quiz |
| **Tests** | `POST` | `/api/v1/client/tests/:id/start` | 🔒 | Start CBT exam timer session |
| **Tests** | `POST` | `/api/v1/client/tests/:id/submit` | 🔒 | Submit CBT answers & compute score (+4/-1) |
| **Arena** | `POST` | `/api/v1/client/arena/create` | 🔒 | Create 1v1 challenge link for peer battles |
| **Arena** | `POST` | `/api/v1/client/arena/:id/join` | 🔒 | Join 1v1 challenge as opponent |
| **Arena** | `POST` | `/api/v1/client/arena/:id/submit` | 🔒 | Submit 1v1 quiz answers & find winner |
| **Analytics** | `GET` | `/api/v1/client/analytics/prep-lab` | 🔒 | The Prep Lab accuracy & weak topic breakdown |
| **Mentors** | `GET` | `/api/v1/client/mentors` | 🔒 | List AIIMS/IIT ranker mentors (Cached) |
| **Mentors** | `POST` | `/api/v1/client/mentors/book` | 🔒 | Book 1:1 mentor guidance session |
| **Pulse** | `GET` | `/api/v1/client/aarambh-pulse/today` | 🔒 | Today's 5-minute memory workout |
| **Tools** | `POST` | `/api/v1/client/tools/predict-rank` | ❌ | Estimate NEET AIR Rank from score |
| **Tools** | `POST` | `/api/v1/client/tools/predict-colleges` | ❌ | Medical college recommendations from marks |
| **Batches** | `GET` | `/api/v1/client/batches` | ❌ | List active target courses & batches |
| **Batches** | `POST` | `/api/v1/client/batches/:id/enroll` | 🔒 | Enroll student in target batch |
| **Doubts** | `POST` | `/api/v1/client/doubts` | 🔒 | Submit student doubt with image attachment |
| **Doubts** | `GET` | `/api/v1/client/doubts/my-doubts` | 🔒 | View student doubt history & resolved answers |
| **Bookmarks**| `POST` | `/api/v1/client/bookmarks` | 🔒 | Toggle question bookmark for revision |
| **Bookmarks**| `GET` | `/api/v1/client/bookmarks/my-bookmarks` | 🔒 | Retrieve student bookmarked revision stack |
| **Upload** | `POST` | `/api/v1/client/upload/presigned-url` | 🔒 | Get S3 presigned upload URL for student avatar |

---

### 🛠️ Admin CMS APIs (`/api/v1/admin/*`)

*All Admin routes require Authorization header: `Bearer <admin_jwt_token>`*

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Textbooks** | `POST` | `/api/v1/admin/textbooks/admin` | Create NCERT textbook with S3 PDF URL |
| **Textbooks** | `PUT` | `/api/v1/admin/textbooks/admin/:id` | Update textbook metadata & chapters |
| **Textbooks** | `DELETE` | `/api/v1/admin/textbooks/admin/:id` | Delete textbook & invalidate cache |
| **Questions** | `POST` | `/api/v1/admin/questions/admin` | Add single MCQ / PYQ to question bank |
| **Questions** | `POST` | `/api/v1/admin/questions/admin/bulk` | Bulk import questions array |
| **Tests** | `POST` | `/api/v1/admin/tests/admin` | Create official CBT Mock Test |
| **Mentors** | `POST` | `/api/v1/admin/mentors/admin` | Add new AIIMS ranker mentor profile |
| **Pulse** | `POST` | `/api/v1/admin/aarambh-pulse/admin` | Publish daily memory workout |
| **Batches** | `POST` | `/api/v1/admin/batches/admin` | Create live target batch & schedule |
| **Doubts** | `GET` | `/api/v1/admin/doubts/admin/all` | Review student doubts (Pending & Resolved) |
| **Doubts** | `POST` | `/api/v1/admin/doubts/admin/:id/answer` | Submit resolution answer & solution image |
| **Tools** | `POST` | `/api/v1/admin/tools/admin/college-cutoffs/bulk` | Import college cutoff database |
| **Predictions**| `POST` | `/api/v1/admin/predictions/admin` | Publish prediction proof report |
| **Upload** | `POST` | `/api/v1/admin/upload/presigned-url` | Presigned URL for image & NCERT PDF uploads |

---

## ☁️ AWS CloudWatch Logging & Security

The server uses Winston with AWS CloudWatch transport (`src/middlewares/logging.middleware.js`). Every incoming API request produces a structured log entry sent to AWS:

```json
{
  "timestamp": "2026-09-09T09:55:00.123Z",
  "level": "info",
  "message": "GET /api/v1/client/textbooks - 200 - 12ms",
  "meta": {
    "method": "GET",
    "url": "/api/v1/client/textbooks",
    "status": 200,
    "responseTimeMs": 12,
    "ip": "127.0.0.1",
    "userId": "67cf3b...",
    "userRole": "student"
  }
}
```

If AWS credentials are missing during local development, logging safely falls back to standard console output without throwing exceptions.

---

## 🐳 Production Deployment (AWS EC2 / ECS)

### AWS EC2 Deployment
1. Provision an Ubuntu 22.04 LTS EC2 instance.
2. Install Docker & Docker Compose.
3. Clone repository and set production `.env` parameters (`NODE_ENV=production`, real MongoDB Atlas URI, AWS S3 bucket keys, Redis credentials).
4. Run `docker-compose up -d`.

### AWS ECS (Elastic Container Service) Deployment
1. Build & tag Docker image: `docker build -t aarambh-backend .`
2. Push image to AWS ECR (Elastic Container Registry).
3. Create ECS Task Definition using Fargate launch type.
4. Pass secrets via AWS Secrets Manager or Parameter Store into environment variables.
5. Setup Application Load Balancer (ALB) on port `5000` mapped to HTTPS port `443`.