# Antigravity Kickstart Prompt — CV & Portfolio Builder

## Project Overview

Build a full-stack **CV & Portfolio Builder** web application using **React** (frontend) and **Firebase** (backend). The app enables users to build professional CVs using an AI-powered conversational interface, customize them with templates, colors, and fonts, download them as PDFs, and showcase them alongside a portfolio on a public profile page. The portfolio section will later integrate a React-based visual web builder (this integration is handled in a future phase — do not implement it yet).

The project must be built in **4 structured phases** before the portfolio web builder is integrated. Complete each phase fully before moving to the next. At the end of Phase 4, the app should be production-ready for everything except the portfolio web builder.

---

## Tech Stack

- **Frontend:** React (with React Router, Context API or Zustand for state management)
- **Backend & Database:** Firebase (Firestore, Firebase Auth, Firebase Storage, Firebase Hosting)
- **Functions:** Firebase Cloud Functions (for AI proxy, PDF generation, static export)
- **AI Integration:** Abstracted AI service layer — configurable to support OpenAI (GPT-4o), Anthropic (Claude), or Google Gemini via environment variables. The AI provider should be swappable without changing core application logic.
- **PDF Generation:** Puppeteer or react-pdf via a Firebase Cloud Function
- **Styling:** Tailwind CSS + CSS variables for dynamic theming (colors, fonts)
- **Auth:** Firebase Authentication

---

## Target Audience

All user types: freelancers, job seekers, students, fresh graduates, and professionals across all industries.

---

## Authentication

Support the following sign-in methods via Firebase Auth:
- Email & Password (with email verification)
- Google Sign-In (OAuth)
- LinkedIn OAuth (via custom Firebase Auth flow or Firebase Extension)

Include: protected routes, persistent sessions, password reset, and a clean onboarding flow that captures the user's name and role/industry after first sign-in.

---

## Monetization — Freemium Model

Implement a freemium tier system stored in Firestore against each user profile:

- **Free tier:** Access to a limited set of CV and portfolio templates (marked as free), basic AI usage (capped interactions per day), PDF download with a subtle watermark, public profile page with standard URL.
- **Premium tier:** Access to all templates (free + premium), unlimited AI usage, watermark-free PDF export, custom profile URL slug, priority support flag.

Enforce tier restrictions in both the UI (lock icons, upgrade prompts) and Firebase Security Rules / Cloud Functions. Do not build the payment gateway — just scaffold the tier field in Firestore and the upgrade prompt UI with a placeholder "Upgrade" button for future Stripe integration.

---

## PHASE 1 — Authentication & User Foundation

### Goals
Set up the full authentication system and base app shell.

### Deliverables
1. Firebase project configuration with Firestore, Auth, and Storage initialized.
2. Auth flows: Email/Password sign-up & login, Google OAuth, LinkedIn OAuth, password reset, email verification.
3. Onboarding screen (post-signup): collect full name, professional title/industry, and profile photo (uploaded to Firebase Storage).
4. Firestore user document schema established: `userId`, `displayName`, `email`, `photoURL`, `title`, `industry`, `tier` (free/premium), `createdAt`, `publicSlug`, `socialLinks`, `cvIds[]`, `portfolioId`.
5. Protected route wrapper component for all authenticated pages.
6. Responsive app shell: sidebar/nav with links to Dashboard, CV Builder, My Profile, Settings. Admin link visible only to users with `role: admin` in Firestore.
7. User settings page: update profile info, change password, manage social links (LinkedIn, GitHub, Twitter/X, personal website, Dribbble, Behance).
8. Firebase Security Rules: users can only read/write their own documents.

---

## PHASE 2 — AI-Powered CV Builder

### Goals
Build the full CV creation, editing, customization, and PDF export experience.

### CV Sections to Support
All of the following must be supported as distinct, reorderable sections:
- Personal Info & Professional Summary
- Work Experience
- Education
- Skills & Tools
- Certifications & Awards
- Projects
- Languages
- References

### 2A — AI Conversation Interface

Implement a **hybrid AI chat flow** for CV building:

- When a user starts a new CV, an AI chat panel opens.
- The AI guides the user **section by section** with friendly, conversational prompts (e.g., "Let's start with your work experience — tell me about your most recent role. You can write as much or as little as you like.").
- The user can respond **freely in natural language** — no rigid form fields at this stage.
- The AI interprets the response, asks natural follow-up questions if details are missing, then **writes polished CV content** from the user's input and populates the relevant CV section.
- Users can also **skip the AI** and type directly into any CV section field at any time.
- The AI chat history for each CV is saved in Firestore so users can resume sessions.
- The AI service must be abstracted behind a Firebase Cloud Function acting as a proxy — the AI provider (OpenAI, Claude, Gemini) is set via environment variable (`AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`). The prompt templates and system instructions live in a config file so they can be updated without code changes.
- Implement a **daily AI interaction cap** for free-tier users (configurable in Firestore config), with a graceful upgrade prompt when the limit is hit.

### 2B — CV Editor

After AI populates a section (or the user types directly), the content is editable in a structured form editor alongside the live CV preview:

- Drag-and-drop section reordering.
- Add/remove/reorder entries within each section (e.g., multiple jobs, multiple degrees).
- Rich text support for description fields (bold, italic, bullet lists).
- "Regenerate with AI" button per section — re-prompts the AI to rewrite that section's content.

### 2C — Template System

- CV templates are stored as React components registered in a template registry.
- Template metadata (id, name, thumbnail, isFree, category) is stored in a Firestore `cvTemplates` collection.
- Users browse templates in a gallery, with free/premium labeling and lock icons for premium templates on free tier.
- Applying a template instantly re-renders the live preview.
- Users can customize per template: **primary color, secondary color, accent color, heading font, body font** — all applied via CSS variables injected into the template.
- Font options sourced from Google Fonts (curated list of ~15 professional fonts).
- Customization state is saved to Firestore alongside the CV data.
- Support multiple saved CVs per user (free: up to 2, premium: unlimited).

### 2D — PDF Export

- "Download PDF" triggers a Firebase Cloud Function that renders the CV template with user data and customization options using Puppeteer and returns a PDF.
- Free tier: PDF includes a small "Created with [AppName]" footer watermark.
- Premium tier: clean, watermark-free PDF.
- PDF filename: `[UserName]-CV-[TemplateName].pdf`.

### 2E — Firestore CV Schema

Each CV document under `users/{userId}/cvs/{cvId}`:
- `cvId`, `title`, `templateId`, `customization` (colors, fonts), `sections` (structured data per section), `aiChatHistory[]`, `lastUpdated`, `createdAt`

---

## PHASE 3 — Public Profile Page

### Goals
Give every user a shareable public profile page that showcases their CV and (later) their portfolio.

### Deliverables

1. **Public URL:** Each user gets a profile at `yourapp.com/u/[publicSlug]`. The slug is auto-generated from their name on signup and can be customized by premium users in settings.

2. **Profile Page Sections (public-facing, read-only):**
   - Header: profile photo, name, professional title, social links (icons linking to LinkedIn, GitHub, etc.)
   - **CV Preview:** A rendered, read-only view of the user's chosen "featured" CV using the selected template and customization. Visitors cannot download it — there is no download button on the public page.
   - **Portfolio Section:** Placeholder section with a "Coming Soon" or "Portfolio not set up yet" state. This is where the web builder output will be embedded in a future phase. Scaffold the section and its Firestore field (`portfolioPublished: false`) but do not build the builder yet.
   - **Contact Form:** A simple form (name, email, message) that saves submissions to Firestore under `users/{userId}/contactMessages/{messageId}` and optionally sends an email notification to the profile owner via Firebase Cloud Function + a transactional email service (e.g., SendGrid — scaffold the integration with an env variable).

3. **Profile Visibility Settings:** In the user's dashboard, allow them to toggle: profile public/private, which CV is featured on their profile, show/hide contact form, show/hide social links.

4. **SEO & Meta Tags:** Each public profile page should render appropriate Open Graph and Twitter Card meta tags (name, title, profile photo) for link previews when shared on social media.

5. **Firebase Security Rules:** Public profile data readable by anyone when profile is set to public. Contact form submissions writable by anyone (with rate limiting via Cloud Function), readable only by the profile owner.

---

## PHASE 4 — Admin Panel

### Goals
Build a secure, feature-rich admin panel for platform management.

### Access Control
Users with `role: "admin"` in their Firestore document gain access to the `/admin` route. All admin Cloud Functions verify this role server-side before executing.

### 4A — Template Management

**CV Templates:**
- Upload a new CV template: provide name, category, thumbnail image (uploaded to Firebase Storage), and the template React component code as a file upload (stored in Storage, dynamically registered).
- Edit template metadata: name, category, thumbnail, mark as free or premium.
- Enable/disable templates (disabled templates are hidden from users but not deleted).
- Delete templates (with confirmation).
- Preview any template with sample data.

**Portfolio Templates:**
- Same management interface as CV templates but for the `portfolioTemplates` Firestore collection.
- These templates will be used by the web builder in the future phase. For now, admins can upload and manage their metadata and thumbnail previews. Store them in Firestore and Firebase Storage ready for the builder integration.

### 4B — Export Portfolio Websites

- A user's portfolio (once built in the future phase) will be stored as structured JSON in Firestore.
- Build the export Cloud Function scaffold now: an admin can trigger an export for any user's portfolio, which will render the portfolio template with the user's data and package it as a static HTML/CSS/JS bundle downloadable as a `.zip` file.
- For Phase 4, implement the export trigger UI and Cloud Function shell with a clear TODO marker where the web builder rendering logic will plug in. The zip packaging and download mechanism should be fully functional even if the rendered content is a placeholder for now.

### 4C — User Management

- Table view of all users: name, email, tier (free/premium), join date, CV count, profile public/private, last active.
- Search and filter by tier, join date, active status.
- Admin actions per user: manually upgrade/downgrade tier, disable/enable account, delete account (with cascade deletion of all user data via Cloud Function), view their public profile.
- Bulk actions: export user list as CSV.

### 4D — Analytics Dashboard

Display aggregate platform metrics pulled from Firestore:
- Total users, new signups (last 7/30 days)
- Free vs premium user breakdown (chart)
- Total CVs created, PDFs downloaded
- Most used CV templates (ranked)
- Contact form submissions count
- AI interactions count (last 7/30 days)

Use a simple charting library (e.g., Recharts) for visualizations. Data can be aggregated via a scheduled Firebase Cloud Function that writes summary stats to a Firestore `analytics` collection daily, rather than live aggregation queries.

---

## PHASE 5 (Future — Do Not Build Yet) — Portfolio Web Builder Integration

This phase will integrate a separately developed React-based visual web builder. At that point:
- Users will be able to select a portfolio template and customize it visually in the builder.
- The builder output (structured JSON or HTML) will be saved to Firestore under `users/{userId}/portfolio`.
- The public profile page portfolio section will render the saved portfolio.
- The admin export function will render and zip the portfolio as a static site.

**Preparation required in Phases 1–4:** Scaffold all Firestore fields, placeholder UI sections, Cloud Function shells, and admin UI hooks that this phase will need, clearly marked with `// TODO: Phase 5 - Web Builder Integration` comments throughout the codebase.

---

## General Engineering Standards

- All sensitive operations (PDF generation, AI calls, user tier checks, admin actions) must go through Firebase Cloud Functions — never expose API keys or admin logic to the client.
- Use environment variables for all third-party API keys (`AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `SENDGRID_API_KEY`, etc.).
- Firestore Security Rules must enforce that users can only access their own data, public profiles are readable based on the `isPublic` flag, and all admin operations are server-side only.
- The app must be fully responsive (mobile, tablet, desktop).
- Implement loading states, error boundaries, and user-friendly error messages throughout.
- Use React lazy loading and code splitting for the CV editor and admin panel to keep initial bundle size small.
- Write clear `// TODO: Phase 5` comments anywhere the web builder will plug in so the integration point is unambiguous.
- Use a consistent component library approach — either shadcn/ui or a custom design system with Tailwind — decided at project start and applied consistently.

---

## Deliverable at End of Phase 4

A fully functional, production-deployable application (minus the portfolio web builder) that includes:
- Multi-provider authentication
- AI-assisted CV builder with template gallery, full customization, and PDF export
- Public shareable profile pages with CV preview, contact form, and social links
- Complete admin panel for template management, user management, static export scaffolding, and analytics
- Freemium tier enforcement throughout
- Firebase project fully configured and deployable via `firebase deploy`
