/** Base CV text used to tailor applications. Source: Aakash_Goel_CV_FULL_STACK.pdf */

export const BASE_CV = `
AAKASH GOEL
Senior Full-Stack Engineer & Team Lead · React / Next.js · Node.js · Python · AI & LLM Systems
Delhi, India (Remote) | aakashgoel2040@gmail.com | +91-8015482069 | aakashhportfolioo.netlify.app | github.com/Aakash25612

SUMMARY
Senior full-stack engineer with 8 years building and shipping production web and mobile products end to end, with applications serving 10,000+ users. Owned the full lifecycle - architecture, backend, frontend, infrastructure and release - across telemedicine, logistics, e-commerce and SaaS, and led a team of 5 engineers (2 frontend, 2 backend, 1 QA) on delivery. Deep hands-on experience building AI-native systems: multi-model generative pipelines, agentic tool-use and function calling, vector search, and multi-provider LLM architectures in production. Most recently designed and launched an AI-powered branding platform solo, from zero to production in under five months. Available for full-time remote roles; open to EOR or contractor engagement.

TECHNICAL SKILLS
Frontend: React, Next.js, TypeScript, JavaScript (ES6+), Tailwind CSS, HTML5, CSS3
Backend: Node.js, Express, Python, FastAPI, REST, GraphQL, WebSockets, auth, payments
AI / LLM: LLM API integration (Claude, OpenAI), agentic tool-use & function calling, RAG & vector search (pgvector, Pinecone), FLUX diffusion & vision endpoints, LiteLLM multi-provider architecture, structured JSON generation
Mobile: React Native, Flutter (iOS & Android), App Store / Play Store release
Data: PostgreSQL, MongoDB, Redis, Firebase, Supabase
Infra: AWS, Vercel, Docker, CI/CD, Git, serverless / edge functions

EXPERIENCE

Founding Engineer - BrandoPilot | Remote · Jan 2026 – May 2026
Sole engineer on an AI-powered branding platform for global markets (brandopilot.com) - ~5,000 users.
- Architected and built the entire product with no other engineering resource: Next.js frontend, Node.js backend, Supabase data layer, deployment and infrastructure.
- Designed a hybrid template rendering engine generating brand assets from structured LLM output, with machine-readable metadata for downstream consumption.
- Implemented Generative Engine Optimization - public schema design targeting AI-indexable visibility, ahead of the market on a discovery channel most products still ignore.
- Took the product from zero to live production in under five months and grew it to roughly 5,000 users.

Senior Full-Stack Engineer / Team Lead - Independent Consulting | Remote · Mar 2024 – Present
Engineering lead on web, mobile and AI products for venture-backed startups and international product teams.
- Led a team of 5 - 2 frontend engineers, 2 backend engineers and 1 QA - owning architecture decisions, code review, sprint planning and release quality.
- AI Media Generation Platform: architected multi-model generative workflows integrating LLMs, FLUX diffusion models and vision endpoints into one automated pipeline for brand asset and media rendering. Optimized prompt-chaining and structured JSON parsing with schema validation at the pipeline boundary, driving validation failures to near zero. Built the cost and reliability layer - credit-based billing, rate limiting and response caching on Supabase Edge Functions and Redis - cutting third-party inference spend while holding low-latency execution.
- AI-Native Application Platform: built AI-native web applications from scratch implementing agentic tool-use, function calling and vector search (pgvector / Pinecone) for context-aware generation. Engineered async background job queues and WebSocket streaming in Next.js and Node.js to deliver real-time progress during heavy generative rendering, plus secure serverless pipelines for dynamic asset creation and cross-platform export.
- Telemedicine platform: delivered a healthcare provider dashboard serving 10,000+ users, covering patient data views, scheduling and role-based access control.
- Enterprise CRM: built independently with native HubSpot, Slack and email integrations plus an AI chatbot layer, covering OAuth flows, sync logic, webhooks and rate-limit handling.
- Logistics dispatch: built a real-time service queue system handling live dispatch and status propagation, React/Next.js frontend against a Node.js WebSocket backend.
- Migrated a client's legacy Replicate inference pipeline to a multi-provider LLM architecture via LiteLLM, adding structured text generation and generative asset indexing while removing single-vendor dependency.
- Shipped multiple cross-platform mobile applications in Flutter and React Native, owning the cycle from UI implementation through App Store and Play Store release.
- Established an AI-assisted development workflow (Cursor, Claude Code) with retained code review and test discipline, compressing delivery cycles substantially.
- Rated in the top 10% of engineers on Upwork - Top Rated, 100% Job Success Score, 5.0/5.0 across 32 client reviews.

Full-Stack Engineer - Contract Engagements | Remote · Sep 2018 – Mar 2024
Long-running engineering engagements with international clients across e-commerce, on-demand services and SaaS.
- Architected and deployed production applications and backend services supporting recurring commercial workloads.
- Built responsive React frontends against Node.js and Firebase backends, integrating third-party APIs for payments, messaging and data sync.
- Handled database design and query optimization across relational and document stores, removing API latency bottlenecks through indexing strategy and query tuning.
- Retained by multiple clients across successive engagements on the strength of delivery consistency.
`.trim();

export type CvExperience = {
  role: string;
  company: string;
  dates: string;
  location: string;
  summary?: string;
  bullets: string[];
};

export type CvDocument = {
  name: string;
  title: string;
  contact: string;
  summary: string;
  skills: { label: string; value: string }[];
  experience: CvExperience[];
};
