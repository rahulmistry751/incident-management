# Incident Management System with AI Root Cause Analysis

A modern, production-ready full-stack Incident Management System featuring automated AI-driven root cause analysis, severity recommendations, and incident summarization. The application is built with a fast and secure **NestJS & Fastify** backend and a reactive **Next.js** frontend.

---

## 🚀 Key Features

- **Incident CRUD**: Create, read, update, and delete incidents.
- **AI-Powered Incident Analysis**: Automatically generates a concise summary, recommends severity levels, and diagnoses potential root causes when an incident is created.
- **Dynamic AI Configuration**: Supports both **Google Gemini** and **OpenAI** APIs, switchable dynamically or via environment configuration.
- **Swagger Documentation**: Self-documenting API explorer for rapid development and testing.
- **E2E Testing**: Complete automated end-to-end testing suite for UI validation.

---

## 🛠️ Tech Stack

### Backend (`/backend`)
- **Framework**: [NestJS](https://nestjs.com/) with the high-performance [@nestjs/platform-fastify](https://docs.nestjs.com/techniques/performance) adapter.
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/) (PostgreSQL client).
- **AI Clients**: `@google/genai` (Gemini SDK) and `openai` (OpenAI SDK).
- **Validation**: `class-validator` & `zod` schema validations.
- **Testing**: [Vitest](https://vitest.dev/) for unit and integration testing.
- **API Docs**: [Swagger OpenAPISpec](https://swagger.io/).

### Frontend (`/frontend`)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19).
- **UI Components**: TailwindCSS and Lucide Icons.
- **E2E Testing**: [Playwright](https://playwright.dev/) for browser-based automation tests.

---

## 📂 Repository Structure

```text
incident-management/
├── backend/                  # NestJS Fastify application
│   ├── src/
│   │   ├── db/               # Database schemas and connection setup
│   │   ├── incidents/        # Incident management endpoints & logic
│   │   ├── ai/               # AI clients and prompt analysis services
│   │   └── main.ts           # Application entry point
│   ├── drizzle/              # Database migration SQL files
│   ├── tsconfig.json         # TypeScript configuration
│   └── package.json          # Node scripts and dependencies
│
└── frontend/                 # Next.js client application
    ├── app/                  # Next.js app pages (Router)
    ├── components/           # Shared React components
    ├── lib/                  # Fetching utilities and state managers
    ├── tests/                # Playwright E2E test specs
    └── package.json          # Node scripts and dependencies
```

---

## ⚙️ Setup Instructions

### Prerequisites
Before getting started, make sure you have the following installed:
1. **Node.js** (v18.x or v20.x recommended)
2. **PostgreSQL** instance (local or hosted like [Neon](https://neon.tech))
3. **Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/)) and/or **OpenAI API Key** (from [OpenAI Platform](https://platform.openai.com/))

---

### Step 1: Backend Configuration & Start

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Create your environment configuration file:
   ```bash
   cp .env.example .env
   ```

4. Open the newly created `.env` file and set the required environment variables:
   ```env
   # Database connection string for PostgreSQL
   DATABASE_URL="postgresql://username:password@localhost:5432/incident_db?schema=public"

   # AI Configuration
   AI_PROVIDER="gemini" # Choose 'gemini' or 'openai'
   GEMINI_API_KEY="your-gemini-api-key-here"
   OPENAI_API_KEY="your-openai-api-key-here"
   AI_MODEL="gemini-2.0-flash" # Model ID matching your selected provider
   AI_TEMPERATURE="0.2"

   # Server Port
   PORT=3000
   ```

5. Push the database schema to your PostgreSQL database using Drizzle Kit:
   ```bash
   npm run db:push
   ```

6. Run the NestJS development server:
   ```bash
   npm run dev
   ```
   
   The backend server will spin up at `http://localhost:3000`. 
   
7. Access the **Swagger API Documentation**:
   Open [http://localhost:3000/documentation](http://localhost:3000/documentation) in your web browser to explore and interact with the available endpoints.

---

### Step 2: Frontend Configuration & Start

1. Open a new terminal window/tab and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   
   The frontend server will spin up at `http://localhost:4000`. Open [http://localhost:4000](http://localhost:4000) in your browser to view the user interface.

*Note: Next.js dev server configurations are set up to proxy all backend API requests via `/api/*` to `http://localhost:3000/api/*` automatically.*

---

## 🧪 Running Tests

### Backend Unit & Integration Tests
The backend uses **Vitest** for testing:
```bash
cd backend
npm run test          # Run tests once
npm run test:watch    # Run tests in watch mode
```

### Frontend End-to-End (E2E) Tests
The frontend uses **Playwright** for E2E tests:
```bash
cd frontend
npx playwright install # Install browser binaries (first-time only)
npm run test:e2e       # Run headless E2E tests
npm run test:e2e:ui    # Run E2E tests with the Playwright UI runner
```

---

## 🗄️ Database Architecture

The database schema utilizes standard tables defined in [backend/src/db/schema.ts](./backend/src/db/schema.ts):

- **`incidents`**: Stores general incident information such as title, description, status (`OPEN`, `IN_PROGRESS`, `RESOLVED`), and severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **`incident_analyses`**: Stores the AI-generated results for an incident, including an automatically recommended severity, a detailed summary, and identified root causes, linked via a foreign key relation to the `incidents` table.
- **`llm_configs`**: Holds system configuration variables for the dynamic AI provider settings.
- **`llm_prompts`**: Holds customized prompts for orchestrating LLM queries.
