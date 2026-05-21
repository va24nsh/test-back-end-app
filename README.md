# Mutanex Server

Backend server for Mutanex Patient App.

## ⚠️ IMPLEMENTATION RULES & PHILOSOPHY
See `docs/api-implementation-ruleset.md` for complete implementation guidelines.

## Structure

```
server/
├── src/
│   ├── server.ts              # Main server entry point
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   ├── middlewares/           # Express middlewares
│   ├── models/                # Data models
│   ├── migrations/            # Database migrations
│   ├── routes/                # API routes
│   ├── utils/                 # Utility functions
│   ├── types/                 # TypeScript types
│   ├── validators/            # Joi validation schemas
│   ├── errors/                # Error classes
│   ├── adapters/              # Service adapters (Firebase, Email, OTP)
│   └── docs/                  # Documentation
├── package.json
├── tsconfig.json
├── .env.example               # Credential template (see below)
└── README.md
```

## Modules (Phase 1)

- **Auth** - Authentication, OTP, session management
- **Onboarding** - User onboarding and profile setup
- **Dashboard** - Dashboard data and stats
- **Reports** - Medical reports management
- **Consents** - Doctor access request management
- **Notifications** - Notification system
- **Clinical Analytics** - Analytics and insights
- **Visits** - Visit logging and management
- **Profile** - User profile management

## Phase 2 Modules

- **Prescriptions** - Prescription management
- **Appointments** - Appointment scheduling

---

## Environment & Credentials Setup

### ⚠️ CRITICAL: All credentials must be explicitly provided (no fallbacks)

1. **Copy `.env.example` template**:
   ```bash
   cp .env.example .env
   ```

2. **Fill in all credentials** (see details below). Every field marked as "Required" must be populated with actual values.

3. **Never commit `.env`** to version control. Only commit `.env.example`.

### Required Credentials by Service

#### 1. Database (PostgreSQL)
| Variable | Required | Description |
|---|---|---|
| `POSTGRES_HOST` | ✅ Yes | PostgreSQL server hostname (e.g., `localhost`) |
| `POSTGRES_PORT` | ✅ Yes | PostgreSQL port (default: `5432`) |
| `POSTGRES_DB` | ✅ Yes | Database name (e.g., `mutanex_dev`) |
| `POSTGRES_USER` | ✅ Yes | Database username (e.g., `postgres`) |
| `POSTGRES_PASSWORD` | ✅ Yes | Database password (must be secure, no defaults) |
| `POSTGRES_TEST_DB` | ⭕ Optional | Test database name (if running tests) |

**How to set up PostgreSQL**:
```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Linux (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
createdb mutanex_dev
createuser postgres  # or use existing user
psql mutanex_dev -U postgres  # test connection
```

---

#### 2. JWT & Encryption (Required for all environments)
| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ Yes | Secret key for signing JWT tokens (min 32 characters, randomly generated) |
| `JWT_EXPIRY` | ✅ Yes | Access token expiry (explicit value required, e.g. `15m`) |
| `JWT_REFRESH_EXPIRY` | ✅ Yes | Refresh token expiry (explicit value required, e.g. `7d`) |
| `ENCRYPTION_KEY` | ✅ Yes | Key for encrypting OTP codes (min 32 characters, randomly generated) |

**How to generate secure keys**:
```bash
# Generate JWT_SECRET (32 bytes in hex = 64 chars)
openssl rand -hex 32

# Generate ENCRYPTION_KEY (same format)
openssl rand -hex 32
```

**Example**:
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
ENCRYPTION_KEY=b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1
```

---

#### 3. Firebase Admin SDK (Required for authentication)
| Variable | Required | Description |
|---|---|---|
| `FIREBASE_PROJECT_ID` | ✅ Yes | Firebase project ID (e.g., `mutanex-prod-12345`) |
| `FIREBASE_CLIENT_EMAIL` | ✅ Yes | Service account email (format: `*@iam.gserviceaccount.com`) |
| `FIREBASE_PRIVATE_KEY` | ✅ Yes | Private key (PEM format, multiline) |

**How to get Firebase credentials**:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. **Project Settings** (gear icon, top-left)
4. **Service Accounts** tab
5. **Node.js** section
6. Click **Generate new private key**
7. A JSON file downloads with your credentials

**From the downloaded JSON file**, copy:
- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY` (keep as multiline string with `\n`)

**Example .env**:
```env
FIREBASE_PROJECT_ID=mutanex-prod-12345
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@mutanex-prod-12345.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----"
```

---

#### 4. reCAPTCHA v3 (Required for protecting public APIs)
| Variable | Required | Description |
|---|---|---|
| `RECAPTCHA_SECRET_KEY` | ✅ Yes | reCAPTCHA v3 secret key (protects public endpoints) |
| `RECAPTCHA_SCORE_THRESHOLD` | ✅ Yes | Minimum reCAPTCHA score (0–1, default: `0.5`) |

**How to get reCAPTCHA keys**:

1. Go to [Google Cloud Console reCAPTCHA Admin](https://console.cloud.google.com/security/recaptcha)
2. Create a new key with:
   - **Label**: `Mutanex Patient App`
   - **Type**: `reCAPTCHA v3`
   - **Domains**: Add your domain(s)
3. Copy **Secret Key** → `RECAPTCHA_SECRET_KEY`

**Example .env**:
```env
RECAPTCHA_SECRET_KEY=6LcD...dKmE  # Your actual secret key
RECAPTCHA_SCORE_THRESHOLD=0.5
```

---

#### 5. Email Provider (Brevo / Sendinblue)
| Variable | Required | Description |
|---|---|---|
| `BREVO_API_KEY` | ✅ Yes | Brevo SMTP API key for sending emails |
| `BREVO_SENDER_EMAIL` | ✅ Yes | Sender email address used in verification emails |
| `BREVO_SENDER_NAME` | ✅ Yes | Sender name used in verification emails |

**How to get Brevo API key**:

1. Sign up at [Brevo](https://www.brevo.com/) (formerly Sendinblue)
2. Go to **SMTP Settings**
3. Create an API key (if not already created)
4. Copy the key → `BREVO_API_KEY`

**Example .env**:
```env
BREVO_API_KEY=xkeysib_abc123xyz789...
BREVO_SENDER_EMAIL=noreply@yourcompany.com
BREVO_SENDER_NAME=Mutanex Patient App
```

---

#### 6. OTP Provider Configuration
| Variable | Required | Description |
|---|---|---|
| `OTP_PROVIDER` | ✅ Yes | OTP provider choice (set explicitly, currently `firebase`). Backend abstracts provider; can swap without app deployment. |

**Currently supported**: `firebase` (implementation is abstracted; can be swapped for MSG91, Twilio, etc.)

---

#### 7. Cloud Storage Provider (Optional)
| Variable | Required | Description |
|---|---|---|
| `CLOUD_PROVIDER` | ✅ Yes | Provider choice: `local`, `aws`, `gcp` (set explicitly) |
| `STORAGE_BUCKET_NAME` | ✅ Yes | Bucket/directory name (set explicitly) |
| `STORAGE_SIGNING_SECRET` | ✅ Yes | Secret for signing storage URLs |
| `STORAGE_WORKSPACE_ID` | ✅ Yes | Workspace identifier (set explicitly) |

**If using AWS S3**:
```env
CLOUD_PROVIDER=aws
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=abc123...
```

**If using Google Cloud Storage**:
```env
CLOUD_PROVIDER=gcp
GCP_PROJECT_ID=my-gcp-project
GCP_CLIENT_EMAIL=service-account@...iam.gserviceaccount.com
GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

---

#### 8. Server & CORS Configuration
| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ Yes | Environment: `development`, `staging`, `production` |
| `PORT` | ✅ Yes | Server port (explicit value required) |
| `LOG_LEVEL` | ✅ Yes | Logging level: `debug`, `info`, `warn`, `error` |
| `APP_PUBLIC_URL` | ✅ Yes | Public app URL used to generate email verification links |
| `CORS_ORIGIN` | ✅ Yes | Primary allowed origin (e.g., `http://localhost:3000`) |
| `ALLOWED_ORIGINS` | ⭕ Optional | Comma-separated list of allowed origins |
| `SKIP_CSRF` | ⭕ Optional | Set to `true` to disable CSRF protection (dev only) |

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
# Edit .env and fill in ALL required credentials (see above)
```

### 3. Set Up Database
```bash
# Run migrations
npm run migrate

# (Optional) Seed test data
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```

Server will start at `http://localhost:3000`

---

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without emitting

### Database
- `npm run migrate` - Run all pending migrations
- `npm run migrate:status` - Check migration status
- `npm run migrate:create --name <name>` - Create new migration
- `npm run migrate:undo` - Undo last migration
- `npm run seed` - Run all seeders
- `npm run seed:create --name <name>` - Create new seeder
- `npm run seed:undo` - Undo last seeder

### PM2 (Production)
- `npm run start:pm2` - Start with PM2 (max instances)
- `npm run start:pm2:local` - Start with PM2 (single instance)
- `npm run start:pm2:qa` - Start with PM2 (2 instances)

---

## Testing

```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

---

## API Documentation

See [API Documentation](./docs/README.md) for complete endpoint specifications:
- [Auth & Session APIs](./docs/api/01-auth-session.md)
- [Common API Rules](./docs/api/00-common.md)
- [Implementation Ruleset](./docs/api-implementation-ruleset.md)

---

## Error Handling & Logging

All errors use centralized error classes in `src/errors/`:
- `ValidationError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `TooManyRequestsError` (429)
- `InternalServerError` (500)

All logs include `requestId` for request tracing. Sensitive data (tokens, OTPs, PII) are never logged.

---

## Deployment

### Pre-deployment Checklist

- [ ] All credentials in `.env` are set to production values
- [ ] Database credentials are changed from defaults
- [ ] JWT_SECRET and ENCRYPTION_KEY are randomly generated (not example values)
- [ ] Firebase credentials are for production project
- [ ] reCAPTCHA credentials are for production site
- [ ] Brevo API key is valid
- [ ] CORS_ORIGIN and ALLOWED_ORIGINS point to production domain(s)
- [ ] NODE_ENV is set to `production`
- [ ] All environment variables are injected via secret management (not `.env` file)

### Environment Variable Injection

In production, **never use `.env` files**. Inject credentials via:
- Docker secrets
- Kubernetes secrets
- AWS Secrets Manager / Systems Manager Parameter Store
- Google Cloud Secret Manager
- HashiCorp Vault
- Cloud hosting platform's secrets service

---

## Troubleshooting

### "Missing required environment variables"
- Ensure all variables in `.env.example` are set in your `.env`
- Check for typos in variable names
- Verify `JWT_SECRET` and `ENCRYPTION_KEY` are not empty

### Firebase authentication errors
- Verify `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` match your Firebase project
- Ensure private key is copied exactly (including `-----BEGIN PRIVATE KEY-----` and newlines)

### reCAPTCHA validation fails
- Check `RECAPTCHA_SECRET_KEY` is correct
- Verify domain is added to reCAPTCHA keys in Google Cloud Console
- Ensure `RECAPTCHA_SCORE_THRESHOLD` is between 0 and 1

### Email sending fails
- Verify `BREVO_API_KEY` is valid
- Check `BREVO_SENDER_EMAIL` is verified in Brevo console
- Ensure recipient email is not in spam/block list

---

## Support

For implementation questions, see:
- [API Implementation Ruleset](./docs/api-implementation-ruleset.md)
- [Example Auth Implementation](./docs/example-auth-implementation.md)
- [Flow Documentation](./docs/flow-*.md)
npm run seed:undo
```

### Sequelize Configuration

- Migrations are located in `src/database/migrations/`
- Seeders are located in `src/database/seeders/`
- Models are located in `src/models/`
- Database config is in `src/config/database.js`

The Sequelize CLI uses the `.sequelizerc` file to locate these directories.

## PM2 Deployment

### Starting with PM2

1. Build the project:
```bash
npm run build
```

2. Start with PM2:
```bash
# Production
npm run start:pm2

# QA
npm run start:pm2:qa

# Local
npm run start:pm2:local
```

**Note:** PM2 management commands (stop, restart, delete, logs) should be run directly using `pm2` CLI:
```bash
pm2 stop mutanex-server-prod
pm2 restart mutanex-server-prod
pm2 delete mutanex-server-prod
pm2 logs mutanex-server-prod
```

### PM2 Configuration

The `ecosystem.config.js` file contains three separate configurations:
- **Local**: Single instance, fork mode, NODE_ENV=local, port 3000
- **QA**: 2 instances, cluster mode, NODE_ENV=qa, port 3000
- **Production**: Max instances, cluster mode, NODE_ENV=production, port 3000

Each environment has separate log files in `./logs/{env}/` directory.

## Features

### Central Error Handling

All errors should extend from `AppError` or use predefined error classes:

```typescript
import { BadRequestError, NotFoundError, ValidationError } from '../errors';

// In controllers
throw new BadRequestError('Invalid input');
throw new NotFoundError('User not found');
throw new ValidationError('Validation failed', { email: ['Invalid email'] });
```

### Central Response Middleware

Use `res.sendResponse()` for success responses and `res.sendError()` for errors:

```typescript
// Success response
res.sendResponse({ user: userData }, 'Success message', 200);

// Error response
res.sendError(new NotFoundError('User not found'));
// or
res.sendError('Something went wrong', 500);
```

Response envelopes:

```json
{
  "isSuccess": true,
  "message": "Success message",
  "data": {},
  "timestamp": "2026-01-06T09:00:00.000Z",
  "requestId": "req_123",
  "elapsedTime": "12ms"
}
```

```json
{
  "isSuccess": false,
  "message": "Human readable message",
  "error": { "name": "Error", "code": "INTERNAL_SERVER_ERROR", "details": {} },
  "timestamp": "2026-01-06T09:00:00.000Z",
  "requestId": "req_123",
  "elapsedTime": "12ms"
}
```

### Request ID & Logging

Every request automatically gets:
- Unique request ID (in `req.requestId` and `X-Request-ID` header)
- Request timing (elapsed time in response)
- Automatic request logging (method, path, IP, headers)
- Context-aware logging (request ID and timing in all logs)

```typescript
import { logger } from '../utils/logger';

// Logger automatically includes request ID and timing
logger.info('User created', req);
logger.error('Failed to create user', error, req);
```

### Authentication Middleware

The `authenticateMiddleware` validates JWT tokens and attaches user to `req.user`:

```typescript
// User is available in req.user after authentication
const userId = req.user?.id;
```

### Security Middlewares

The server includes comprehensive security middlewares:

#### CORS Configuration
- Configurable allowed origins via `ALLOWED_ORIGINS` environment variable
- Defaults to localhost ports for development
- Supports credentials and custom headers
- Mobile apps (no origin) are allowed by default

#### Helmet Security Headers
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- Cross-Origin Resource Policy
- XSS protection and other security headers

#### CSRF Protection
- Validates JWT tokens for protected routes
- Skips CSRF for GET, HEAD, OPTIONS requests
- Skips CSRF for public endpoints (auth routes)
- Can be disabled via `CSRF_ENABLED=false` environment variable

#### Rate Limiting
- General API rate limiting: 100 requests/15min (prod), 1000/15min (dev)
- Strict auth rate limiting: 5 requests/15min for authentication endpoints
- Configurable via `RATE_LIMIT_ENABLED=false` environment variable
- Returns 429 status with proper error response

#### Environment Variables

Add these to your `.env` file:

```bash
# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Security Features
CSRF_ENABLED=true
RATE_LIMIT_ENABLED=true
```

