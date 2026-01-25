# alpadev Monorepo
A comprehensive, scalable monorepo for building Sechel Systems applications. This project is built with Turborepo to manage multiple applications and packages efficiently.

## Project Structure

```
alpadev-monorepo/
├── apps/                 # Frontend applications
│   └── frontend/   # Next.js web application
├── packages/             # Shared packages
│   ├── api/              # API integrations
│   ├── auth/             # Authentication utilities
│   ├── db/               # Database client and schema
│   ├── email/            # Email templates and sending
│   ├── utils/            # Shared utilities
│   ├── validations/      # Shared validation schemas
│   ├── web3/             # Web3 integrations and utilities
│   └── configs/          # Shared configuration
└── ...
```

## Prerequisites

- Node.js >= 22 (see `.nvmrc` for the exact version)
- PNPM package manager (v10.11.0 or newer)
- Docker and Docker Compose (for local development with PostgreSQL)

## Getting Started

1. Clone the repository

   ```bash
   git clone https://github.com/alpadev44/alpadev-monorepo.git
   cd alpadev_ai_monorepo
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env
   ```

4. Start the PostgreSQL database (optional)

   ```bash
   docker-compose up -d
   ```

5. Initialize the database

   ```bash
   pnpm db:push
   pnpm db:seed # Optional, to seed with initial data
   ```

6. Start the development server

   ```bash
   pnpm dev
   ```

## Available Scripts

### Development

- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications
- `pnpm start` - Start all applications in production mode
- `pnpm clean` - Clean build outputs and node_modules

### WhatsApp Webhook

- `pnpm --filter @package/api webhooks:dev` - Start the WhatsApp webhook server in development mode

### Database Management

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema changes to the database
- `pnpm db:migrate` - Create and apply migrations
- `pnpm db:seed` - Seed the database with initial data
- `pnpm db:deploy` - Deploy migrations in production
- `pnpm db:pull` - Pull database schema
- `pnpm db:reset` - Reset the database (caution: this will delete all data)

### Code Quality

- `pnpm lint` - Lint all code
- `pnpm format` - Format all code

## Environment Variables

The project uses various environment variables for configuration. See `turbo.json` for a complete list of supported variables.

Key environment variables include:

- `DATABASE_URL` - MongoDB connection string
- `NEXTAUTH_URL` - Auth callback URL
- `NEXTAUTH_SECRET` - Secret for NextAuth
- `NEXT_PUBLIC_APP_URL` - Public URL of the application
- `RESEND_KEY` - API key for Resend email service
- `RESEND_EMAIL_DOMAIN` - Email domain for Resend
- `TWILIO_ACCOUNT_SID` - Twilio Account SID for WhatsApp integration
- `TWILIO_AUTH_TOKEN` - Twilio Auth Token for WhatsApp integration
- `TWILIO_WHATSAPP_NUMBER` - Twilio WhatsApp Sandbox number
- `WEBHOOK_BASE_URL` - Base URL for webhook endpoints (ngrok URL for development)
- `WEBHOOK_PORT` - Port for webhook server (default: 3003)

## Local Development Database

The project includes a Docker Compose configuration for running a local PostgreSQL database:

```bash
docker-compose up -d
```

Default database configuration:

- Host: localhost
- Port: 5432
- User: admin
- Password: root
- Database: test_db

## API Documentation

The project includes a built-in tRPC UI documentation page similar to Swagger for browsing and testing the API:

- Available at `/api/docs` in the Next.js application
- Only accessible in development mode
- Provides an interactive UI to explore all tRPC endpoints
- Lists available procedures, input parameters, and output types

You can use this documentation page to:

1. Browse all available API endpoints
2. Test API calls directly from the browser
3. Understand input/output types for each procedure
4. Debug API interactions during development

To access the documentation, start the development server with `pnpm dev` and navigate to `http://localhost:3000/api/docs` in your browser.

## 📱 WhatsApp Webhook Setup

The project includes a WhatsApp webhook integration using Twilio. This allows your application to receive and respond to WhatsApp messages automatically.

### Prerequisites

- Twilio Account with WhatsApp Sandbox enabled
- ngrok (for local development tunneling)
- Node.js environment with required packages

### Environment Variables

Add these variables to your `.env` file:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Twilio Sandbox number

# Webhook Configuration
WEBHOOK_BASE_URL=https://your-ngrok-url.ngrok-free.app
WEBHOOK_PORT=3003
```

### Step-by-Step Setup

#### 1. Install ngrok (if not already installed)

```bash
# Mac (using Homebrew)
brew install ngrok

# Or download from https://ngrok.com/download
```

#### 2. Start the Webhook Server

```bash
# Start the webhook server on port 3003
pnpm --filter @package/api webhooks:dev
```

You should see:
```
🔧 Environment check:
WEBHOOK_BASE_URL: https://your-ngrok-url.ngrok-free.app
TWILIO_ACCOUNT_SID: ✓ Set
TWILIO_AUTH_TOKEN: ✓ Set
🚀 Webhook server running on port 3003
📌 Webhook URL: https://your-ngrok-url.ngrok-free.app/webhooks/whatsapp
```

#### 3. Start ngrok Tunnel

In a separate terminal:

```bash
# Create a tunnel to your local webhook server
ngrok http 3003
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`) and update your `WEBHOOK_BASE_URL` in `.env`.

#### 4. Configure Twilio Webhook

1. Go to [Twilio Console > WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. In the **Sandbox Configuration** section:
   - **When a message comes in**: `https://your-ngrok-url.ngrok-free.app/webhooks/whatsapp`
   - **Method**: `POST`
   - **Status callback URL**: `https://your-ngrok-url.ngrok-free.app/webhooks/whatsapp`
   - **Method**: `POST`
3. Click **Save**

#### 5. Join WhatsApp Sandbox

1. Send a WhatsApp message to the Twilio Sandbox number: `+1 415 523 8886`
2. Send the join code (usually something like `join <code>`)
3. You'll receive a confirmation message

### Testing the Integration

1. **Send a test message** to the Twilio WhatsApp number
2. **Check your webhook logs** - you should see:
   ```
   ➡️  POST /webhooks/whatsapp | proto=https host=your-ngrok-url.ngrok-free.app
   📨 Webhook received body: { From: 'whatsapp:+1234567890', Body: 'Hello', ... }
   💬 Processing incoming message
   📤 Sending personalized TwiML response: Gracias por tu mensaje YourName. Te responderemos muy pronto.
   ```
3. **Receive automatic response** in WhatsApp with your personalized name

### Webhook Features

- **✅ Automatic Responses**: Personalized messages using the sender's WhatsApp profile name
- **✅ Message Storage**: All incoming and outgoing messages are stored in the database
- **✅ Status Updates**: Real-time tracking of message delivery status (sent → delivered → read)
- **✅ User Management**: Automatic guest user creation for new WhatsApp contacts
- **✅ Signature Validation**: Secure webhook validation using Twilio signatures

### Troubleshooting

#### Common Issues:

1. **Signature Validation Failed**
   - Ensure `WEBHOOK_BASE_URL` matches your ngrok URL exactly
   - Verify `TWILIO_AUTH_TOKEN` is correct
   - Check that the webhook URL in Twilio console is correct

2. **Messages Not Received**
   - Verify ngrok tunnel is active and pointing to port 3003
   - Check webhook server is running on the correct port
   - Ensure WhatsApp sandbox is properly joined

3. **Database Errors**
   - Make sure PostgreSQL is running
   - Run database migrations: `pnpm db:push`
   - Check database connection string

#### Webhook Logs

Monitor webhook activity with detailed logs:
```bash
# The webhook server provides detailed logging:
➡️  POST /webhooks/whatsapp | proto=https host=... # Request received
📨 Webhook received body: {...}                     # Parsed webhook data
🔐 Validating signature for URL: ...                # Security validation
💬 Processing incoming message                       # Message processing
📤 Sending personalized TwiML response: ...         # Automatic response
📊 Status update: delivered                          # Status updates
```

### Production Deployment

For production deployment:

1. Replace ngrok with a permanent domain
2. Enable signature validation (currently disabled for testing)
3. Configure proper SSL certificates
4. Set up monitoring and logging
5. Configure rate limiting and security measures

## Deployment

📚 **Para instrucciones completas de deployment, consulta [DEPLOYMENT.md](./DEPLOYMENT.md)**

Esta guía consolidada incluye:
- ✅ Configuración completa de VPS
- ✅ SSL con Let's Encrypt
- ✅ Nginx optimizado con caché
- ✅ PM2 para gestión de procesos
- ✅ CI/CD con GitHub Actions
- ✅ Optimizaciones de rendimiento

### Opciones de deployment adicionales:

1. **Vercel/Netlify** - Para deployment directo de aplicaciones Next.js
2. **Docker** - Para deployments contenerizados
3. **Custom CI/CD** - Usando los comandos de build para tu infraestructura

## Git Workflow

The project uses commitizen for standardized git commits. When committing changes:

```bash
git add .
# This will trigger the commitizen CLI
git commit
```

## License

See the [LICENSE](LICENSE) file for licensing information.

## Documentation

This project is a fork of NextJet, read the documentation here to get started: https://www.nextjet.dev/docs

# 🌱 Prisma Seeding Guide

| System | Step 1: Set environment variable | Step 2: Go to project folder | Step 3: Run seed |
|--------|----------------------------------|------------------------------|------------------|
| **Mac / Linux (bash/zsh)** | ```bash\nexport DB="mongodb://localhost:27017/komanta?replicaSet=rs0"\n``` | ```bash\ncd /path/to/komanta-monorepo/packages/db\n``` | ```bash\npnpm run db:seed\n``` |
| **Windows (CMD)** | ```bat\nset DB=mongodb://localhost:27017/komanta?replicaSet=rs0\n``` | ```bat\ncd C:\\Users\\<your_user>\\Desktop\\komanta-monorepo\\packages\\db\n``` | ```bat\npnpm run db:seed\n``` |
| **Windows (PowerShell)** | ```powershell\n$env:DB="mongodb://localhost:27017/komanta?replicaSet=rs0"\n``` | ```powershell\ncd C:\\Users\\<your_user>\\Desktop\\komanta-monorepo\\packages\\db\n``` | ```powershell\npnpm run db:seed\n``` |

---

## 🛠 Notes
- Make sure **MongoDB is running as a replica set** (`rs0`).
- If you want to **re-run seeds without duplicate errors**, enable the cleanup section in `seed.ts`.
- You can add the `DB` variable permanently to:
  - `~/.bashrc` or `~/.zshrc` (Mac/Linux)
  - Windows system environment variables.
Mon Oct  6 00:18:59 -05 2025

## 🚀 Auto-Deploy Configurado

El sistema de deployment automático está completamente funcional:
- ✅ Sudo sin contraseña configurado
- ✅ Puerto 3000 se libera automáticamente
- ✅ PM2 reinicia correctamente
- ✅ Cache se limpia en cada deploy

Test deploy - Tue Oct  7 23:31:26 -05 2025
