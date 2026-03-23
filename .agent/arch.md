# SkiFi Designs Website & Lead Platform — AI-Ready Project Specification

## 1. Project Summary

Build a **premium, conversion-focused website** for **SkiFi Designs**, a presentation design agency, using:

- **Next.js**
- **PostgreSQL**
- **Prisma**
- **Tailwind CSS**
- **Ant Design**
- **JWT (`jose`)**
- **js-cookie**
- **Stripe**

The platform should primarily help SkiFi Designs:

1. Generate qualified leads
2. Push visitors toward booking a consultation or starting a project
3. Build long-term value through free PowerPoint templates
4. Introduce an AI-powered template generator as a beta product

This should feel like a **high-end agency website**, not just a portfolio page.

---

## 2. Business Context

### Brand / Company

**SKIFI GROUP LLC**
30 N Gould St Ste R,
Sheridan, WY 82801, US

**EIN:** 981917005

### Contact Details

- **WhatsApp:** +91 7827087878
- **Email:** [contact@skifidesigns.com](mailto:contact@skifidesigns.com)
- **Calendly:** [https://calendly.com/contact-skifidesigns/30min](https://calendly.com/contact-skifidesigns/30min)

### Payment Gateway

- **Stripe**

---

## 3. Core Positioning

### Brand Positioning Statement

SkiFi Designs is a **presentation design agency** specializing in:

- business-ready presentations
- animation-focused PowerPoint decks
- clean, editable, high-impact layouts
- decks for startups, agencies, and corporate teams

### Core Marketing Angle

**“High-impact, animation-driven presentations for startups, agencies, and teams that pitch often.”**

### Website Tone

- Premium
- Modern
- Clean
- Trustworthy
- Conversion-first
- Business-focused

Not playful, cluttered, or overly artistic.

---

## 4. Project Goals

### Primary Goals

1. Convert visitors into booked calls
2. Convert visitors into direct project inquiries
3. Showcase credibility and service clarity
4. Attract traffic through free templates
5. Prepare product structure for future monetization
6. Launch an AI template generator MVP as a separate but connected product experience

### Secondary Goals

1. Build SEO value
2. Build email capture for template-related leads
3. Create scalable architecture for future paid features
4. Make content and template uploads easy for admins

---

## 5. Recommended Product Structure

This project should be treated as **one website with three business modules**:

### Module A — Main Marketing Website

Purpose: agency brand presence and lead generation

### Module B — Free PowerPoint Template Platform

Purpose: SEO, authority, organic traffic, email capture, future digital-product monetization

### Module C — AI Template Generator (Beta)

Purpose: experimental acquisition tool and lead magnet / product wedge

---

## 6. Scope Overview

## Phase 1 Includes

1. Landing / marketing website
2. Services and pricing presentation
3. Calendly integration
4. Social proof and portfolio links
5. Template gallery/resource platform
6. Optional email capture for template updates
7. AI template generator page integration
8. Admin-side manageable content/data structure
9. Mobile responsive implementation
10. Fast-loading production-ready frontend

## Important Scope Clarification

The original brief says **payment gateway is out of scope for now**, but the latest requirement includes **Stripe**.

### Recommended interpretation

Implement the system in a **Stripe-ready architecture**, with one of these two approaches:

#### Option A — Preferred for Phase 1

- Prepare database and code structure for Stripe
- Do not expose paid checkout yet
- Keep all CTAs focused on booking / inquiry
- Add Stripe later with minimal refactor

#### Option B — If client explicitly wants payment in Phase 1

- Add simple Stripe checkout for one-time payments and/or retainer onboarding
- Limit it to a minimal flow
- Keep account/dashboard and subscription management out of scope unless explicitly requested

For AI implementation, assume **Stripe should be integrated in an extensible way, but final payment UX can be feature-flagged**.

---

## 7. Information Architecture

### Primary Navigation

- Home
- Services
- Pricing
- Free Templates
- AI Template Generator (Beta)
- Book a Call

### Recommended Footer Links

- Home
- Services
- Pricing
- Free Templates
- AI Template Generator
- Contact
- Privacy Policy
- Terms of Service
- WhatsApp
- Email
- Portfolio / Behance
- Instagram
- Fiverr

---

## 8. Detailed Website Requirements

# A. Home / Landing Page

## Objective

Turn visitors into:

- booked consultation calls
- WhatsApp leads
- contact form leads
- visitors to free templates
- users exploring the AI generator

## Required Sections

### 1. Hero Section

**Goal:** immediately explain what SkiFi Designs does and drive action.

#### Content

- Headline centered around presentation design agency + animation focus
- Supporting subtext emphasizing business-ready, visually compelling PowerPoint presentations
- Primary CTA: **Book a Free Call**
- Secondary CTA: **Explore Free Templates**
- Optional micro-trust line: **Fiverr Vetted Pro | Global Clients**

#### UX Notes

- Strong headline hierarchy
- One clear hero visual: premium presentation mockups or agency showcase
- Keep animation subtle and lightweight
- Avoid overly heavy website motion

#### Recommended CTA destinations

- Book a Free Call → Calendly section or dedicated booking page
- Explore Free Templates → template gallery page

---

### 2. Who This Is For

**Goal:** qualify the visitor quickly.

#### Layout

Three cards:

1. **Startups & Founders** — pitch decks, investor presentations
2. **Agencies & Consultants** — ongoing presentation support
3. **Corporate Teams** — reports, strategy decks, internal decks

#### UX Notes

- Each card should include a short problem/benefit statement
- This section should help users self-identify in less than 5 seconds

---

### 3. Services Overview

**Goal:** explain what the agency actually delivers.

#### Service Positioning

- Presentation Design
- Pitch Deck Design
- Corporate Presentation Design
- Business Reports & Strategy Decks
- Animation-focused PowerPoint Presentations
- Clean, editable, business-friendly layouts

#### Recommended presentation format

Use 4–6 service cards with:

- title
- one-line explanation
- optional deliverables/examples

#### Suggested service grouping

1. Pitch Decks
2. Sales & Marketing Decks
3. Corporate & Internal Reports
4. Animated PowerPoint Presentations
5. Ongoing Deck Support / Retainer

---

### 4. Pricing Section

**Goal:** present simple, clear buying options.

#### Option 1 — Per Slide

- **$15 per slide**
- Any presentation type
- Includes animation
- CTA: **Start a Project**
- Small note: turnaround depends on scope and complexity

#### Option 2 — Monthly Retainer

- **$999 monthly retainer**
- Up to 100 slide credits per month
- Priority support
- Ideal for agencies, startups, and teams with recurring deck needs
- Badge: **Most Popular**
- CTA: **Book Strategy Call**

#### Business Rule

- Unused credits do not roll over
- This is an internal rule and does not need heavy emphasis in UI

#### UX Notes

- Keep the pricing section extremely clean
- Emphasize simplicity and confidence
- Use a comparison layout
- Retainer card should be visually highlighted

---

### 5. Calendly Booking Section

**Goal:** reduce friction and make consultation booking easy.

#### Requirements

- Embed Calendly widget using the provided link
- Heading: **Book a Free Consultation**
- Must be visible on the landing page without excessive scrolling
- No paywall

#### Recommended implementation

- Inline embed on homepage
- Sticky CTA buttons throughout site leading here

---

### 6. Fiverr Presence & Social Proof

**Goal:** build trust quickly.

#### Requirements

- Highlight **Fiverr Vetted Pro**
- Fiverr logo + profile link
- Credibility line such as: trusted by founders, agencies, and global clients

#### Recommended expansion

Also support:

- testimonials
- client logos
- before/after presentation samples
- ratings snapshot

These can be made CMS-driven later.

---

### 7. Portfolio & Social Buttons

**Goal:** provide fast credibility paths.

#### Required Buttons

- **View Portfolio (Behance)** — primary
- **Instagram** — secondary

#### Notes

- Behance should be more prominent
- Instagram can be framed as behind-the-scenes / reels / updates
- Add icons for fast recognition

---

# B. Free PowerPoint Template Platform

## Objective

Create an SEO and lead-generation resource hub inspired by platforms like Envato / 24Slides.

## Phase 1 Requirements

### Core Features

- Grid-based template gallery
- Categories:
  - Pitch Deck
  - Corporate
  - Marketing
  - Reports

- Free download
- No login required
- Templates optimized for PowerPoint

### Lightweight Lead Capture

- Optional email field: **Get notified when new templates drop**
- Download must not be blocked by email requirement unless later changed

### Future-Ready Requirements

- Structure should support future paid plans
- Easy admin upload for templates
- Easy categorization and metadata management

## Recommended Template Data Model

Each template should support:

- title
- slug
- description
- category
- preview images
- thumbnail
- tags
- file URL / download asset
- file type
- file size
- free/paid flag
- featured flag
- SEO metadata
- status (draft/published)
- createdAt / updatedAt

## Recommended User Experience

### Template Listing Page

- Search
- Category filters
- Sort options
- Template cards with preview image
- Download CTA
- Optional email signup block

### Template Detail Page

- Preview gallery
- Description
- Use cases
- Format details
- Download button
- Related templates
- Email notification signup

### Future Compatibility

The architecture should later support:

- paid templates
- bundled template packs
- user accounts
- order history
- Stripe checkout

Even if these are not launched in Phase 1.

---

# C. AI Template Generator (Beta)

## Objective

Expose a lightweight AI-powered template generation experience as a beta feature.

## Existing Reference

Reference provided:
[https://skifi-ai-client.vercel.app/generate](https://skifi-ai-client.vercel.app/generate)

## Requirements

- Separate page or sub-product experience
- Clean UI
- User enters preferences
- Logic is already designed externally
- Output is a downloadable PowerPoint template

## Required Messaging

Use beta / experimental framing.

Suggested microcopy:
**“Generate a clean, editable PowerPoint layout in seconds.”**

## Recommended Product Decisions

- Treat as a dedicated page under main website navigation
- Show beta badge clearly
- Explain what the tool does in one sentence
- Keep inputs simple and structured
- Provide strong CTA to try it

## Recommended Functional Flow

1. User opens generator page
2. User fills preferences form
3. Frontend sends request to generator service/API
4. User receives processing feedback
5. Generated template becomes downloadable
6. Optional capture of lead data or usage analytics

## Integration Recommendation

The main app should integrate with the AI generator via:

- internal API proxy route, or
- separate service endpoint

This keeps the frontend flexible and secure.

---

## 9. Suggested Pages

### Public Pages

1. Home
2. Services
3. Pricing
4. Free Templates Listing
5. Free Template Detail
6. AI Template Generator (Beta)
7. Contact / Book a Call
8. Privacy Policy
9. Terms of Service

### Optional Additional Pages

1. About
2. Portfolio
3. Thank You page after form submission / booking
4. Template category pages

---

## 10. User Flows

# Flow 1 — Lead Generation via Booking

1. User lands on homepage
2. Understands service quickly
3. Sees target audience and pricing
4. Scrolls to booking section
5. Books consultation via Calendly

# Flow 2 — Lead Generation via Project Inquiry

1. User sees pricing or service page
2. Clicks **Start a Project**
3. Opens contact form / WhatsApp / strategy-call pathway
4. Inquiry is submitted

# Flow 3 — SEO to Template Download

1. User lands on template gallery via search
2. Filters or searches templates
3. Opens template detail page
4. Downloads free template
5. Optionally subscribes for new templates

# Flow 4 — Product Discovery via AI Generator

1. User discovers generator page
2. Tries beta generator
3. Downloads generated template
4. Can be nurtured into agency client or template subscriber

---

## 11. Design & UX Direction

### Design Principles

- Minimal
- Modern
- Premium
- Strong typography
- Presentation-first aesthetic
- Conversion-focused layout
- Clean whitespace
- Professional trust signals

### Performance Principles

- Fast loading
- Avoid heavy animation libraries unless necessary
- Use animation only to reinforce premium feel, not distract
- Mobile responsiveness is mandatory

### UI Direction

Since **Tailwind + Ant Design** are both requested, use them carefully:

#### Recommended approach

- Use **Tailwind** for layout, spacing, responsiveness, and visual system
- Use **Ant Design** selectively for advanced components like:
  - tables (if needed in admin)
  - drawers/modals
  - forms
  - pagination
  - upload components

Avoid making public pages feel like a default Ant Design dashboard.

---

## 12. Technical Architecture

# Frontend

- Next.js App Router
- Tailwind CSS
- Ant Design
- Responsive component system
- Reusable section-based homepage architecture
- TanStack Query for data fetching

# Backend

- Next.js server routes / server actions where suitable
- PostgreSQL database
- Prisma ORM
- JWT auth using `jose`
- Cookie-based token handling with `js-cookie` on client side where needed

# Storage / Assets

The system should support storage for:

- template files
- template preview images
- portfolio/media assets
- possible AI generator outputs

Recommended to abstract file storage so it can later use S3/R2/Cloud storage.

---

## 13. Authentication Strategy

### Current Need

The public website does **not require user login** in Phase 1.

### Why JWT/Jose/Cookies Are Still Relevant

Auth may still be required for:

- admin panel access
- internal content management
- protected upload flows
- future paid user accounts

### Recommended Decision

Build **admin authentication only** for now, with future-ready structure for user auth.

#### Recommended auth stack

- Access token / session strategy using JWT with `jose`
- Secure cookie strategy
- Role-based access for admin users

---

## 14. Admin / CMS Recommendations

The brief does not explicitly ask for a full CMS, but the product clearly needs manageable content.

## Recommended Admin Capabilities

### Content Management

- update homepage sections
- manage pricing content
- manage service cards
- manage social/profile links
- manage credibility/trust content

### Template Management

- upload template files
- upload preview images
- assign categories
- add title/slug/description/tags
- mark featured/free/published
- manage SEO fields

### Lead Management

- view template notification signups
- view contact inquiries
- track booking-related data if captured

### AI Generator Management (optional basic)

- control feature visibility
- update beta label/copy
- configure external endpoint/settings

---

## 15. Suggested Database Entities

This is a recommended schema direction, not final Prisma code.

### AdminUser

- id
- name
- email
- passwordHash
- role
- createdAt
- updatedAt

### SiteSetting

- id
- key
- value
- group
- updatedAt

### Service

- id
- title
- slug
- shortDescription
- fullDescription
- icon
- sortOrder
- isActive
- createdAt
- updatedAt

### PricingPlan

- id
- title
- slug
- priceText
- billingType
- description
- features
- ctaLabel
- ctaType
- isHighlighted
- sortOrder
- isActive
- createdAt
- updatedAt

### TemplateCategory

- id
- name
- slug
- description
- sortOrder
- isActive
- createdAt
- updatedAt

### Template

- id
- categoryId
- title
- slug
- shortDescription
- description
- thumbnailUrl
- previewImages
- tags
- downloadUrl
- sourceFileUrl
- isFree
- isFeatured
- status
- seoTitle
- seoDescription
- downloadCount
- createdAt
- updatedAt

### TemplateNotificationSubscriber

- id
- email
- source
- createdAt

### ContactInquiry

- id
- name
- email
- company
- message
- phone
- source
- status
- createdAt

### PortfolioLink

- id
- platform
- title
- url
- isPrimary
- sortOrder

### ExternalLink

- id
- type
- label
- url
- isActive

### GeneratorRequestLog (optional)

- id
- inputPayload
- outputFileUrl
- status
- email
- createdAt

### PaymentProduct / StripePlan (future-ready)

- id
- type
- name
- stripeProductId
- stripePriceId
- status

---

## 16. Stripe Integration Recommendation

Because the brief conflicts on whether payment is in scope, the AI should implement Stripe in a way that supports both immediate use and delayed launch.

## Recommended Stripe Scope

### Minimum implementation

- Prepare environment variables
- Create reusable payment service layer
- Model price/plan references in database
- Keep checkout feature behind config flag if not launched now

### If payment is enabled now

Possible payment flows:

1. Pay per project deposit
2. Purchase a monthly retainer
3. Future template purchases

### Avoid in Phase 1 unless explicitly approved

- complex subscription management dashboard
- invoice portal
- usage reconciliation logic
- customer self-serve billing center

---

## 17. SEO Strategy

The website should not be a single long landing page only. It should be SEO-capable.

## Recommended SEO Priorities

- indexable service pages or content sections
- template category pages
- template detail pages
- metadata per template and category
- schema where useful
- clean slugs
- Open Graph data
- sitemap
- robots setup

### Primary SEO opportunities

- free PowerPoint templates
- pitch deck templates
- corporate presentation templates
- marketing presentation templates
- AI PowerPoint template generator
- presentation design agency

---

## 18. Analytics & Tracking Recommendations

Track at minimum:

- CTA clicks
- Calendly click/open events
- template downloads
- template signup submissions
- AI generator usage starts/completions
- contact form submissions

Recommended to keep analytics provider pluggable.

---

## 19. Non-Functional Requirements

### Performance

- fast page load
- optimized images
- lazy loading where appropriate
- minimal JS on marketing pages

### Accessibility

- semantic structure
- button contrast
- keyboard-usable navigation
- form labeling

### Security

- protected admin routes
- secure file upload handling
- server-side validation
- rate limiting for public forms and generator endpoints
- secure env handling

### Scalability

- modular architecture
- clear separation between marketing content, templates, and AI generator
- file storage abstraction
- Stripe-ready product structure

---

## 20. Recommended Route Structure

```txt
/
/services
/pricing
/free-templates
/free-templates/[category]
/free-templates/[slug]
/ai-template-generator
/book-a-call
/contact
/privacy-policy
/terms

/admin
/admin/login
/admin/dashboard
/admin/templates
/admin/templates/new
/admin/templates/[id]
/admin/services
/admin/pricing
/admin/settings
/admin/leads
```

---

## 21. Suggested Component Structure

### Public UI Components

- Navbar
- Footer
- HeroSection
- AudienceSection
- ServicesSection
- PricingSection
- CalendlyEmbedSection
- SocialProofSection
- PortfolioLinksSection
- CTASection
- TemplateGrid
- TemplateCard
- TemplateFilterBar
- GeneratorForm

### Admin Components

- ProtectedLayout
- Sidebar
- TemplateForm
- UploadField
- RichTextField
- SettingsForm
- PricingPlanEditor
- LeadTable

---

## 22. Key Business Decisions the Build Should Assume

The AI building this should assume the following unless explicitly changed:

1. **Homepage is the main conversion page**
2. **Calendly booking is a core CTA**
3. **Free templates are a traffic and trust channel**
4. **AI generator is beta and may depend on external logic/service**
5. **No public user login is needed in Phase 1**
6. **Admin management is needed even if lightweight**
7. **Stripe should be architecturally supported**
8. **The public site must look premium and custom, not template-like**

---

## 23. Potential Gaps / Ambiguities Identified in the Requirement

These should be treated as implementation assumptions, not blockers.

### Gap 1 — Payment scope conflict

- Brief says payment gateway is out of scope
- New requirement says Stripe

**Assumption:** build Stripe-ready foundation; payment UI can be enabled later or minimally enabled now.

### Gap 2 — AI generator backend ownership

- Brief says logic already designed
- But integration details are not defined

**Assumption:** frontend should integrate with an external/internal API contract and keep generator isolated.

### Gap 3 — Portfolio/Fiverr/Behance/Instagram URLs not fully provided

- Only Calendly/contact details are given

**Assumption:** system should keep these as admin-configurable external links.

### Gap 4 — Template file hosting not specified

**Assumption:** use configurable file storage abstraction.

### Gap 5 — Admin panel not explicitly requested

**Assumption:** lightweight admin is required for real-world maintainability.

---

## 24. Final Build Recommendation

This project should be built as a **modular lead-generation website + resource platform + beta product shell**, not as a simple static marketing page.

### Best implementation direction

- polished custom frontend in Next.js
- structured content architecture
- template management support
- clear conversion funnels
- future-ready monetization foundation
- lightweight but scalable admin system

---

## 25. AI Build Instruction Summary

Use this exact mindset while building:

> Build a premium, conversion-focused presentation design agency website for SkiFi Designs. The platform must combine a high-end marketing site, a free PowerPoint template resource library, and a beta AI template generator page. The primary goal is lead generation through Calendly bookings, project inquiries, template traffic, and trust building. The codebase must be scalable, SEO-friendly, admin-manageable, and architected for future Stripe monetization, while keeping Phase 1 simple and production-ready.

---

## 26. Deliverables Expected from the AI / Developer

1. Full app architecture
2. Route structure
3. Database schema with Prisma
4. Public website UI pages
5. Template resource pages
6. AI generator page integration structure
7. Admin panel for content and template management
8. Auth for admin
9. Stripe-ready service layer
10. Deployment-ready configuration

---

## 27. Phase 1 Acceptance Criteria

The project can be considered complete for Phase 1 when:

1. Homepage clearly presents the agency and converts users
2. Pricing is visible and understandable
3. Calendly is embedded and working
4. Contact details are visible and usable
5. Free templates can be browsed and downloaded
6. Template categories work
7. AI generator page is accessible and usable as beta flow
8. Site is mobile responsive
9. Admin can manage essential content/templates
10. Codebase is structured for future Stripe and paid expansion

---

## 28. Contact / Business Data to Use in Build

### Company

**SKIFI GROUP LLC**

### Address

30 N Gould St Ste R, Sheridan, WY 82801, US

### EIN

981917005

### Email

[contact@skifidesigns.com](mailto:contact@skifidesigns.com)

### WhatsApp

+91 7827087878

### Booking Link

[https://calendly.com/contact-skifidesigns/30min](https://calendly.com/contact-skifidesigns/30min)

### Payment Gateway

Stripe

---

## 29. Tech Stack to Use

- **Next.js**
- **PostgreSQL**
- **Prisma**
- **Tailwind CSS**
- **Ant Design**
- **JWT with jose**
- **js-cookie**

---

## 30. Final Note for the AI

Do not build this as a generic agency site.

Build it as a **premium presentation services growth platform** with:

- conversion-first homepage
- scalable content structure
- free template ecosystem
- beta AI generator integration
- admin-ready architecture
- future monetization readiness
