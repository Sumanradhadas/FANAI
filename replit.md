# FanAI - AI Celebrity Photo Generation Platform

## Overview
FanAI is a full-stack web application enabling users to generate realistic AI photos with celebrities for various occasions. The platform aims to provide a creative tool for users to interact with celebrity imagery, featuring user authentication, celebrity search, template-based AI photo generation, and an administrative panel for content management. It includes a credit-based system and a celebrity request feature. The project's ambition is to eventually integrate advanced AI for realistic face-swapping and image composition.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.
I prefer simple language.
I like functional programming.

## System Architecture
### UI/UX Decisions
- **Design System**: Primary Color: Purple-blue (250° 75% 55%).
- **Typography**: Inter (headings and body), JetBrains Mono (code).
- **Components**: Shadcn UI with custom theming.
- **Theming**: Full dark mode support with theme toggle.

### Technical Implementations
- **Frontend**: React + TypeScript, Tailwind CSS, Shadcn UI, Wouter (routing), TanStack Query.
- **Backend**: Node.js + Express, PostgreSQL (Neon), Drizzle ORM.
- **Image Processing**: Sharp (margin, cropping, watermarking).
- **Authentication**: Firebase Authentication (Email/Password) for users, environment-based credentials for admin.
- **Image Storage**: Celebrity images sourced from a private GitHub repository, served via a proxy endpoint.
- **Deployment**: Configured for Replit VM deployment, with build and start scripts.

### Feature Specifications
- User authentication and separate admin authentication.
- Celebrity search and browsing with a request system for new celebrities.
- Template-based AI photo generation with server-side image processing.
- User dashboard for generation history.
- Admin panel for managing celebrities, templates, campaigns, and user requests.
- Campaign link system and credit-based pricing (demo).
- Watermarking ("FanAI", bottom-right, 60% opacity) on all generated images.

### System Design Choices
- **Database Schema**:
    - `users`: User accounts with Replit Auth, credits, plan info.
    - `celebrities`: Celebrity profiles with images from GitHub.
    - `celebrity_requests`: User-submitted requests for admin approval.
    - `templates`: AI generation prompt templates.
    - `generations`: User generation history.
    - `campaigns`: Campaign tracking.
    - `plans`: Subscription plans (demo).
    - `sessions`: Replit Auth session storage.
- **API Endpoints**: Categorized into Public, Authenticated, and Admin Only, covering celebrity listing, photo generation, user history, and full content management.
- **GitHub Integration**: Fetches celebrity images from `/celebs/{celebrity-slug}.jpg` and syncs templates from `templates.json` within a specified GitHub repository.
- **AI Generation (MVP Simulation)**: Uses Google Gemini AI to analyze and create side-by-side composites as a demonstration, as direct face-swapping is not supported. This allows full application flow while awaiting integration with specialized face-swapping APIs.

## External Dependencies
- **AI Service**: Google Gemini AI (via `@google/genai`).
- **Database**: PostgreSQL (Neon).
- **Authentication**: Firebase Authentication.
- **Image Storage**: GitHub (private repository for celebrity images).
- **Payment Gateway (Demo)**: Razorpay (UI only, no active integration).

## Recent Changes
### October 24, 2025 - Enhanced Campaign Creation with Multi-Template Support
- **Enhanced Campaign Creation System**: 
  - Added celebrity selection dropdown in campaign creation form
  - Added token allocation field for campaign budgets
  - Implemented multiple template upload interface with:
    - Template name and prompt fields for each template
    - Image preview upload capability
    - Dynamic add/remove template functionality
  - Backend now handles multipart form data for template image uploads
  - Campaign templates are created with proper linking to campaigns via `campaignId`
- **Updated Campaign Page Display**:
  - Campaign page now fetches and displays campaign-exclusive templates
  - Shows selected celebrity info with profile image
  - Template cards display with preview images and descriptions
  - Users can select templates to generate photos with the campaign celebrity
- **New API Endpoints**:
  - `GET /api/campaigns/:slug/templates` - Fetches templates for a specific campaign
  - `GET /api/celebrities/:id` - Fetches celebrity by ID
- **Technical Improvements**:
  - Enhanced multipart form handling in campaign creation endpoint
  - Template slugs auto-generated from campaign slug and template name
  - Preview images stored in uploads directory and served via static middleware

### October 24, 2025 - Replit Environment Setup & Campaign Fix
- Successfully imported GitHub project to Replit
- Installed all npm dependencies (629 packages)
- Configured PostgreSQL database and pushed schema using Drizzle
- Set up all required environment secrets:
  - GEMINI_API_KEY (Google Gemini AI)
  - GITHUB_TOKEN, GITHUB_OWNER (GitHub integration)
  - VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID (Firebase auth)
  - ADMIN_USER_ID, ADMIN_PASSWORD (Admin access)
- Created workflow for development server on port 5000
- Configured deployment for Replit VM with build and start scripts
- Added .gitignore file for proper version control
- Verified frontend is loading correctly with Vite HMR
- Confirmed API endpoints are functional (celebrities API tested)
- **Fixed Campaign Creation Error**: Resolved foreign key constraint violation when admin creates campaigns
  - Updated `server/routes.ts` to set `userId=null` for admin-created campaigns instead of `userId='admin'`
  - Campaigns schema already supported nullable userId field
  - Admin can now successfully create campaigns without database errors
- Application is fully operational in Replit environment