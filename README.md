# UnnatE

## AI-Driven Hyper-Local Business Advisory & Financial Structuring Platform

> **From a business idea to an informed business decision.**

UnnatE is a technology platform designed to help **rural micro-entrepreneurs, MSMEs, artisans and emerging businesses** make informed decisions about starting, operating and expanding a business.

Instead of forcing entrepreneurs to navigate disconnected government portals, market information, financial calculations and business-planning tools, UnnatE brings these capabilities together into a single decision-support platform.

The platform combines:

- 🏛️ Government scheme discovery and eligibility evaluation
- 📍 Hyper-local market intelligence
- 📊 MSME and economic data
- 💰 Financial analysis and structuring
- 📄 Detailed Project Report (DPR) generation
- 🔄 What-If business simulation
- 🤖 AI-assisted business advisory
- 📚 Research-backed market evidence

The core design principle is simple:

> **Use deterministic systems where accuracy and rules matter, and AI where interpretation and contextual guidance add value.**

---

# 🎯 Problem

For a first-time entrepreneur, starting a business involves much more than having a business idea.

They need to answer questions such as:

- Is there sufficient market potential in my location?
- What government schemes are relevant to me?
- Am I actually eligible for those schemes?
- How much capital will I need?
- What will my operating costs look like?
- At what point will the business break even?
- What happens if my sales are lower than expected?
- What happens if I increase my selling price?
- How should I structure my business proposal or DPR?

Today, these answers are often spread across:

- Government portals
- Scheme documents
- Statistical datasets
- Financial calculators
- Market reports
- Separate business-planning tools

This creates an **information and decision-making gap**, particularly for small entrepreneurs who may not have access to professional business consulting.

---

# 💡 The UnnatE Solution

UnnatE acts as a **digital business advisory layer** connecting an entrepreneur's profile with structured data, business rules, financial models and analytical intelligence.

```text
                         ENTREPRENEUR
                              │
                              ▼
                      BUSINESS PROFILE
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
   MARKET INTELLIGENCE   GOVERNMENT SCHEMES   FINANCIAL ANALYSIS
          │                   │                   │
          │            DETERMINISTIC             │
          │            ELIGIBILITY               │
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                         DPR BUILDER
                              │
                              ▼
                       WHAT-IF SIMULATOR
                              │
                              ▼
                    INFORMED BUSINESS DECISION
```

The platform therefore moves beyond simple information retrieval.

It helps answer:

> **"Given my business, my location and my financial assumptions, what should I understand before I make this decision?"**

---

# 🚀 Core Product Modules

## 1. Business Dashboard

The dashboard acts as the entrepreneur's central workspace.

It provides access to the major intelligence and planning modules:

- Business overview
- Market intelligence
- Government schemes
- Financial analysis
- DPR Builder
- What-If Simulator

The dashboard connects the different stages of the entrepreneurial workflow rather than treating them as isolated tools.

---

# 📍 2. Hyper-Local Market Intelligence

One of UnnatE's core differentiators is its focus on **location-aware business intelligence**.

Instead of relying exclusively on national-level information, the analytical layer can incorporate:

- State-level information
- District-level MSME data
- Business activity information
- Sector context
- Consumer expenditure benchmarks
- Research-backed market evidence

### Example

Consider an entrepreneur planning to open a bakery in:

**Varanasi, Uttar Pradesh**

The platform can use the entrepreneur's business activity and location to provide market context relevant to that specific environment.

This is fundamentally different from providing the same generic recommendation to every bakery in India.

---

# 🏛️ 3. Government Scheme Discovery & Eligibility

UnnatE maintains a structured database of Central and State government schemes relevant to entrepreneurs and MSMEs.

Examples include schemes such as:

- PMMY / MUDRA
- PMEGP
- PM Vishwakarma
- PM SVANidhi
- NSFDC programs
- Other Central and State programs

The system supports multi-criteria scheme filtering across dimensions such as:

- State
- Sector
- Business activity
- Scheme type
- Category
- Target group
- Gender
- Rural applicability
- Geography

---

## Deterministic Eligibility Engine

A critical architectural decision in UnnatE is that **statutory and rule-based eligibility is not delegated to an LLM.**

The eligibility engine evaluates structured rules against the entrepreneur's profile.

```text
              BUSINESS / USER PROFILE
                        │
                        ▼
             ┌─────────────────────┐
             │ Eligibility Engine  │
             │                     │
             │ Location            │
             │ Business Activity   │
             │ Sector              │
             │ Project Cost        │
             │ Applicant Rules     │
             │ Scheme Conditions   │
             └──────────┬──────────┘
                        │
                        ▼
               ELIGIBLE SCHEMES
                        │
                        ▼
              RELEVANCE / SCORING
```

This ensures that eligibility decisions remain:

- Reproducible
- Explainable
- Rule-based
- Independent of probabilistic generation

The backend implements this through a dedicated eligibility service rather than embedding eligibility logic directly into API routes.

---

# 📊 4. Transparent Recommendation Engine

After eligibility is established, UnnatE can rank relevant programs using a **100-point transparent recommendation framework**.

The scoring framework evaluates multiple dimensions such as:

- Eligibility relevance
- Business and sector alignment
- Geographic relevance
- Financial suitability
- Entrepreneur profile
- Program relevance

This creates a two-stage decision process:

```text
DISCOVER
   ↓
CHECK ELIGIBILITY
   ↓
SCORE RELEVANCE
   ↓
PRESENT RECOMMENDATIONS
```

This distinction is important:

> **A scheme being relevant to a business does not automatically mean the entrepreneur is eligible for it.**

---

# 💰 5. Financial Analysis

UnnatE provides financial structuring capabilities to help entrepreneurs understand the economics of their proposed business.

The financial workflow can incorporate:

- Initial investment
- Operating expenses
- Revenue assumptions
- Profitability
- Break-even analysis
- Funding requirements
- Financial projections

The purpose is to transform:

```text
Business Idea
      ↓
Financial Assumptions
      ↓
Structured Model
      ↓
Business Economics
```

This provides the foundation for both DPR generation and scenario analysis.

---

# 📄 6. DPR Builder

The **Detailed Project Report Builder** converts business and financial information into a structured project-planning workflow.

The DPR is organized around four major areas:

### Business

- Business concept
- Objectives
- Business activity
- Overall business structure

### Customers

- Target customers
- Customer context
- Market considerations

### Operations

- Infrastructure
- Resources
- Operational requirements

### Marketing

- Customer acquisition
- Market positioning
- Go-to-market considerations

These sections are connected with the financial analysis to produce a structured business report.

---

# 🔄 7. What-If Simulator

The What-If Simulator allows an entrepreneur to test different business assumptions before committing capital.

Instead of giving the entrepreneur one static financial projection, UnnatE allows scenarios to be explored interactively.

For example:

```text
Increase Selling Price
        ↓
Revenue Changes
        ↓
Profitability Changes
        ↓
Break-even Changes
```

The simulator can be used to explore changes in variables such as:

- Selling price
- Sales volume
- Costs
- Investment
- Operating assumptions

This turns financial planning from a static calculation into a **decision-support exercise**.

The entrepreneur can therefore ask:

> "What happens to my business if this assumption changes?"

rather than:

> "What is my projected profit?"

---

# 🤖 AI + Deterministic Intelligence

UnnatE deliberately avoids treating AI as a replacement for structured business logic.

The platform follows a **hybrid intelligence architecture**.

## Deterministic Layer

Used where correctness, consistency and explicit rules are required.

Examples:

- Government scheme eligibility
- Location constraints
- Project-cost limits
- Business activity mapping
- Financial calculations
- Structured recommendation scoring
- Database-driven filtering

## AI / Analytical Layer

Used where interpretation and contextual reasoning add value.

Examples:

- Business analysis
- Market interpretation
- Contextual insights
- Natural-language explanations
- Advisory interactions

This architecture prevents a generative model from becoming the source of truth for rules that can be represented explicitly.

---

# 🧠 Data & Research Layer

UnnatE is built around a structured data layer rather than relying exclusively on generated information.

## Government Scheme Data

The backend maintains structured entities for:

- Schemes
- Eligibility rules
- States
- Districts
- Sectors
- NIC activities
- MSME information

---

## UDYAM MSME Data

The platform incorporates UDYAM MSME information at state and district levels.

Current processed coverage includes:

- **36 States / Union Territories**
- **785 districts**
- **27.9 million+ MSMEs**

with classification across:

- Micro
- Small
- Medium enterprises

This provides the geographical foundation for localized business analysis.

---

# 📚 Research Evidence

UnnatE also incorporates research datasets into its analytical layer.

## HCES 2022–23

Household Consumption Expenditure Survey information is used as an empirical consumption benchmark.

The analytical layer maintains distinctions such as:

- Rural consumption
- Urban consumption
- State-level benchmarks
- National-level benchmarks

## PwC Voice of the Consumer 2025

Consumer-market evidence is incorporated into the research layer to provide additional context around consumer behaviour and market trends.

These datasets provide **evidence and context** for analysis rather than being treated as a replacement for on-ground business validation.

---

# 🏗️ System Architecture

UnnatE follows a layered architecture separating the user interface, API layer, business logic and data infrastructure.

```text
┌───────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                                                               │
│       Next.js + React + TypeScript + Tailwind CSS            │
│       Zustand + React Query + Recharts                       │
└─────────────────────────────┬─────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                         API LAYER                             │
│                                                               │
│                    FastAPI + REST APIs                       │
│                       API Versioning                          │
└─────────────────────────────┬─────────────────────────────────┘
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
┌────────────────────┐ ┌───────────────┐ ┌────────────────────┐
│ Eligibility Engine │ │ Recommendation│ │ Financial /        │
│                    │ │ Engine        │ │ Research Services  │
│ Deterministic      │ │ Transparent   │ │                    │
│ Rule Evaluation    │ │ Scoring       │ │ Analysis           │
└─────────┬──────────┘ └───────┬───────┘ └──────────┬─────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                        │
│                                                               │
│     Repositories → Services → SQLAlchemy ORM → PostgreSQL    │
└─────────────────────────────┬─────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                         DATA LAYER                            │
│                                                               │
│ Government Schemes │ MSME │ Geography │ Research │ Profiles  │
└───────────────────────────────────────────────────────────────┘
```

---

# 🧱 Backend Architecture

The backend is organized around clear architectural boundaries.

```text
backend/
├── alembic/                 # Database migrations
│
├── app/
│   ├── core/                # Configuration, security, exceptions
│   ├── db/                  # Database engine and sessions
│   ├── models/              # SQLAlchemy data models
│   ├── schemas/             # Pydantic request/response schemas
│   ├── repositories/        # Database access layer
│   ├── services/            # Business logic
│   ├── api/v1/              # Versioned REST endpoints
│   ├── ml/                  # Analytical / ML components
│   └── utils/               # Supporting utilities
│
├── tests/                   # Automated backend tests
├── requirements.txt
└── README.md
```

This separation keeps:

**API → Business Logic → Data Access → Database**

independent from one another.

---

# 🛠️ Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack React Query
- Zustand
- Recharts

## Backend

- Python 3.11+
- FastAPI
- Uvicorn
- SQLAlchemy 2.x
- Pydantic v2
- Psycopg

## Database

- PostgreSQL
- Alembic migrations

## Intelligence & Analytics

- Deterministic eligibility engine
- Transparent recommendation scoring
- Financial modelling
- Market intelligence
- Scikit-learn analytical components
- AI-assisted advisory

## Security

- Argon2 password hashing
- Environment-based configuration
- CORS controls
- Sanitized API error handling
- Structured user and business-profile management

---

# 🔌 REST API

The backend exposes versioned REST APIs.

## System & Health

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Root status and metadata |
| GET | `/health` | Health check |
| GET | `/api/v1/health` | Versioned health check |

## Government Schemes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/schemes` | List and filter schemes |
| GET | `/api/v1/schemes/{scheme_id}` | Retrieve scheme details |
| POST | `/api/v1/schemes/evaluate-eligibility` | Evaluate profile against schemes |

## Users & Business Profiles

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/users` | Create user |
| GET | `/api/v1/users` | List users |
| GET | `/api/v1/users/{user_id}` | Retrieve user |
| PUT | `/api/v1/users/{user_id}` | Update user |
| POST | `/api/v1/users/{user_id}/business-profiles` | Create business profile |
| GET | `/api/v1/users/{user_id}/business-profiles` | Retrieve user's profiles |
| GET | `/api/v1/business-profiles/{profile_id}` | Retrieve business profile |
| PUT | `/api/v1/business-profiles/{profile_id}` | Update business profile |

The scheme API supports multi-criteria filtering across state, sector, scheme type, category, target group, business activity, gender and rural applicability.

---

# 🔐 Security & Configuration

User credentials are protected using **Argon2id password hashing**.

The application uses environment-based configuration rather than embedding credentials and deployment-specific values directly into the source code.

Sensitive values such as:

- Database credentials
- API keys
- JWT secrets
- Backend URLs

are configured through environment variables.

> **Never commit `.env` files or production credentials to the repository.**

---

# 🧪 Testing & Validation

UnnatE includes automated backend testing using:

- pytest
- FastAPI TestClient
- HTTPX
- Database test fixtures

Testing covers:

- API health
- Database connectivity
- Scheme listing
- Scheme filtering
- Scheme retrieval
- Eligibility evaluation
- Multi-filter combinations
- User creation
- User updates
- Business-profile creation
- Business-profile updates
- Validation and duplicate handling
- Error handling

The project also includes API-level validation of the research and market-intelligence workflow.

Example validation scenario:

**Business:** Bakery  
**Location:** Varanasi, Uttar Pradesh

```text
GET  /api/v1/research/district-market-context
POST /api/v1/research/market-intelligence
```

Both endpoints were successfully validated during development.

---

# 🌐 Deployment

UnnatE uses a cloud-deployed architecture consisting of:

```text
                 Vercel
                   │
                   │
             Next.js Frontend
                   │
                   ▼
                Render
                   │
                   │
             FastAPI Backend
                   │
                   ▼
              PostgreSQL
```

The frontend is deployed through **Vercel**, while the FastAPI backend is deployed through **Render**.

---

## ⚠️ Deployment / Cold-Start Note

> **The FastAPI backend is hosted on Render. Depending on the hosting state, the service may require a short initialization period after inactivity. If the application initially appears unresponsive or a request takes longer than expected, please wait a few moments and refresh the page to allow the backend service to initialize.**

This behaviour is related to the cloud hosting environment and does not require any action beyond waiting briefly and refreshing the application.

---

# ▶️ Running Locally

## Prerequisites

- Node.js
- Python 3.11+
- PostgreSQL
- Git

## Clone

```bash
git clone https://github.com/theakcodes/unnat33.git
cd unnat33
```

---

## Backend

```bash
cd backend

python -m venv venv
```

### Windows

```powershell
.\venv\Scripts\Activate.ps1
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the database connection in `.env`.

Run migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

ReDoc:

```text
http://127.0.0.1:8000/redoc
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will then be available through the local development server.

---

# 🧭 Recommended SIH Evaluation Flow

For judges evaluating the deployed product, the following workflow demonstrates the major capabilities of UnnatE:

```text
                     LANDING PAGE
                          │
                          ▼
                   BUSINESS PROFILE
                          │
                          ▼
                      DASHBOARD
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
           MARKET      SCHEMES      FINANCE
        INTELLIGENCE
             │            │            │
             └────────────┼────────────┘
                          ▼
                      DPR BUILDER
                          │
                          ▼
                   WHAT-IF SIMULATOR
                          │
                          ▼
                 BUSINESS DECISION
```

### Suggested Demo Scenario

A simple rural business such as a **bakery in Varanasi, Uttar Pradesh** can be used to demonstrate the complete workflow.

The evaluator can observe:

1. Business context being established
2. Location-aware market analysis
3. Relevant government schemes being identified
4. Eligibility being evaluated using deterministic rules
5. Financial assumptions being structured
6. A DPR being generated
7. Business assumptions being modified through the What-If Simulator

This demonstrates how the individual modules connect into a single decision-support workflow.

---

# 🏆 What Makes UnnatE Different?

### 1. It is not just an AI chatbot

AI is used where natural-language reasoning adds value.

Critical eligibility and structured calculations remain deterministic.

### 2. It is not just a government scheme search engine

UnnatE goes beyond discovery into **eligibility evaluation and relevance scoring**.

### 3. It is not just a financial calculator

The financial layer connects with the entrepreneur's business profile, DPR and scenario analysis.

### 4. It is hyper-local

The platform incorporates state and district-level information instead of relying entirely on national averages.

### 5. It connects the complete workflow

```text
Business Idea
     ↓
Market Context
     ↓
Government Support
     ↓
Eligibility
     ↓
Financial Viability
     ↓
DPR
     ↓
Scenario Testing
     ↓
Decision
```

The value comes from connecting these components rather than treating each as an isolated feature.

---

# 🌱 Expected Impact

UnnatE is designed to reduce the information and decision-making gap faced by rural entrepreneurs and MSMEs.

### Accessibility

Multiple business-advisory capabilities are brought into one platform.

### Localization

District and state-level information provides greater context for business decisions.

### Transparency

Eligibility is evaluated through explicit rules rather than opaque AI outputs.

### Financial Awareness

Entrepreneurs can understand investment, revenue, costs, profitability and break-even.

### Better Planning

The DPR workflow helps structure a business idea into a formal project plan.

### Decision Support

The What-If Simulator allows entrepreneurs to explore different scenarios before making financial commitments.

---

# 🔮 Future Scope

The platform can be extended through:

- Additional government data and APIs
- Automated scheme updates
- More granular district-level economic indicators
- Additional sector-specific financial models
- Expanded multilingual and voice interaction
- Integration with lending and financial institutions
- Real-time local market signals
- Entrepreneur progress tracking
- Expanded business benchmarking
- Additional analytical and machine-learning models

---

# 📌 Project Philosophy

UnnatE is built around one fundamental principle:

> **Technology should not simply tell an entrepreneur what to do. It should give them the information, evidence and tools required to make a better-informed decision themselves.**

The platform therefore combines:

**Government Data**  
+  
**MSME Data**  
+  
**Hyper-Local Intelligence**  
+  
**Deterministic Eligibility**  
+  
**Financial Modelling**  
+  
**Research Evidence**  
+  
**AI-Assisted Analysis**

into one unified entrepreneurial decision-support platform.

---

# 🚀 UnnatE

### **From a business idea to an informed business decision.**

**Repository:** `theakcodes/unnat33`

---
