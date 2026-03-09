# Future Bridge Project Context

## Project Overview
Future Bridge is a platform designed to help students find and get recommendations for colleges (Engineering, Medical, Diploma, etc.) based on their academic profiles and preferences.

## Architecture

### Frontend (sj-future-bridge-ui-v2)
- **Framework**: React with Vite
- **Styling**: Tailwind CSS + Shadcn UI + Vanilla CSS
- **State Management**: React Context (`AuthContext`) + TanStack Query
- **Routing**: React Router DOM (`src/App.tsx`)
- **Form Handling**: React Hook Form + Zod for validation
- **Services**: `src/services/api.ts` (Main API service)

### Backend (sj-futurebridge-be)
- **Framework**: FastAPI
- **Deployment**: Azure Functions (ASGI wrapper)
- **Database**: MongoDB (Motor)
- **Structure**:
    - `future_bridge/api`: API Routers (v1)
    - `future_bridge/models`: Pydantic Models
    - `future_bridge/services`: Business Logic
    - `future_bridge/repositories`: Database Access
    - `future_bridge/utils`: Utility functions (JWT, Email, DB connection)

## Key Workflows
- **Authentication**: OTP-based login/signup via email (Microsoft Email Service).
- **Recommendations**: Core engine for generating college suggestions based on cutoffs and user scores.
- **Support**: Ticketing system for raising and tracking issues.

## Development Rules
- All code should be modular and easy to maintain.
- Frontend files should not exceed 500 lines.
- Premium and dynamic UI design is a priority.
- Always check logs for errors before completing changes.
