# Discovery Platform

A modern web application for validating and verifying public claims using AI-powered analysis.

## Features

- User authentication and authorization
- Claim creation and management
- AI-powered claim validation
- Additional data request workflow
- RTI (Right to Information) request management
- Comprehensive audit logging

## Technology Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- React Query for state management
- React Router for navigation

### Backend
- Node.js with Express
- SQLite database (PostgreSQL-ready)
- OpenAI GPT-4 integration
- JWT authentication

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
cd discovery-platform
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. Start development servers:
\`\`\`bash
npm run dev
\`\`\`

## Development

- Frontend runs on http://localhost:5173
- Backend API runs on http://localhost:3000

## Project Structure

\`\`\`
discovery-platform/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── types/      # TypeScript definitions
│   └── public/         # Static assets
├── server/             # Backend Node.js application
│   ├── src/
│   │   ├── controllers/# Route controllers
│   │   ├── models/     # Database models
│   │   ├── routes/     # API routes
│   │   └── services/   # Business logic
│   └── db/            # Database migrations
└── docs/              # Documentation
\`\`\`

## License

Private - All rights reserved 