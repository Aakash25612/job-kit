/** Base CV text used to tailor applications. Source: Aakash_Goel_CV_FullStack_AI.pdf */

export const BASE_CV = `
AAKASH GOEL
Full-Stack Engineer · AI-Powered Products, AI Agents & Automation
Delhi, India (Remote) | aakashgoel2040@gmail.com | +91-8015482069 | aakashhportfolioo.netlify.app | github.com/Aakash25612

SUMMARY
Full-stack engineer with 6 years of experience designing, building and shipping production web, mobile and AI products end to end. Apps I have built serve 1M+ users combined, with several past 10,000+ users and some used daily by enterprises. I build AI-native systems: LLM agents with tool use and function calling, RAG pipelines, multi-provider LLM setups and workflow automations that replace manual work. Strong in React/Next.js, Node.js, Python/FastAPI, PostgreSQL and AWS. I regularly lead engineering teams of 3 to 9 developers, and I took an AI SaaS from zero to production solo in under five months. Upwork Top Rated, 100% Job Success Score.

TECHNICAL SKILLS
AI / Agents: Claude & OpenAI APIs, AI agents with tool use & function calling, RAG & vector search (pgvector, Pinecone), LiteLLM multi-provider routing, structured JSON output, vision models, AI chatbots
Automation: Workflow automation, Temporal, queues & background jobs, webhooks, Playwright / Puppeteer browser automation, Google Apps Script, scheduled jobs, third-party API integrations
Frontend: React, Next.js, TypeScript, JavaScript (ES6+), Tailwind CSS
Backend: Node.js, Express, Python, FastAPI, REST, GraphQL, WebSockets, microservices, Go, Kafka
Data: PostgreSQL (row-level security, multi-tenant), MongoDB, Redis, Firebase, Supabase
Cloud / DevOps: AWS (EC2, ECS, Lambda, RDS, S3, CloudFront, IAM), Azure, Docker, Kubernetes, CI/CD, Vercel
Mobile: React Native, Flutter (iOS & Android), App Store / Play Store releases
Billing & Testing: Stripe, Polar.sh, webhook verification · pytest, Jest, Supertest, Postman/Newman in CI

EXPERIENCE

Senior Full-Stack & AI Engineer / Team Lead - Independent Consulting | Remote · Mar 2024 – Present
Lead engineer on web, mobile and AI products for startups and product teams in the US, UK and Europe.
- Lead engineering teams of 3–9 across projects (frontend, backend, mobile, QA), owning architecture, code review, sprint planning and release quality.
- AI agents: built LLM agents with tool use and function calling that read live data, call internal APIs and take actions, with schema-validated outputs and safe fallbacks; cut manual handling for client ops teams by ~60%.
- AI automations: replaced manual work with automated pipelines (webhooks, queues, scheduled jobs, browser automation) for lead capture, data extraction, CRM sync and reporting, saving clients 20+ hours of manual work per week.
- Enterprise CRM: built with native HubSpot, Slack and email integrations plus an AI chatbot layer, used daily by 40+ sales and support staff; cut lead response time from hours to minutes.
- AI media platform: multi-model generative workflows (LLMs, diffusion, vision) with async job queues and WebSocket progress streaming; cut JSON validation failures from ~8% to under 0.5%.
- Migrated a client's single-vendor inference pipeline to a multi-provider LLM architecture (LiteLLM), removing vendor lock-in and lowering inference costs by ~30%.
- Logology & Feedspace: Stripe subscription billing end to end; fixed a seller-earnings drift bug by making transactions the single source of truth, ending payout disputes.
- Automated API testing with pytest, Jest + Supertest and Postman/Newman in CI, covering failure paths and cross-tenant access; raised coverage to 80%+ and cut production regressions by ~50%.
- Shipped telemedicine dashboards (10,000+ users), a real-time logistics dispatch system and Flutter / React Native apps to both stores.

Founding Engineer - BrandoPilot (brandopilot.com) | Remote · Jan 2026 – May 2026
Sole engineer on an AI-powered branding SaaS: Next.js frontend, Node.js backend, Supabase/PostgreSQL, AWS deployment.
- Built a rendering engine that turns structured LLM output into brand assets; multi-tenant auth with PostgreSQL row-level security.
- Integrated Polar.sh subscriptions with verified webhooks; took the product from zero to production in under 5 months, ~5,000 users.

Full-Stack Engineer - KL Dugar Group | Mar 2023 – Sep 2025
- Built a centralized ERP used by 200+ staff across 5 business units, replacing spreadsheet-driven processes and cutting manual reporting time by ~70%.
- Built a CRM unifying leads and customer history, and an insurance management system for policies, renewals and claims that cut claim processing time by ~40%.
- Built a real-time fleet management system tracking 100+ vehicles, and an AI chatbot that now resolves ~60% of routine queries without staff.

Full-Stack Engineer - Contract Engagements | Remote · Sep 2020 – Mar 2023
- Delivered 30+ production apps for e-commerce, on-demand and SaaS clients: React frontends on Node.js/Firebase backends, with payments, messaging and data sync APIs.
- Designed databases and tuned queries and indexes to cut API response times by up to 60%; retained by clients across repeat engagements.

PROJECTS & PROFILE
tertAI: built solo, a platform that turns AI-generated apps (Cursor, v0) into live products, automating hosting, database setup and access control on AWS + Kubernetes.
BrandoPilot (brandopilot.com): AI-powered, multi-tenant branding SaaS, built solo from zero to ~5,000 users.
Upwork: https://www.upwork.com/freelancers/aakashgoel · Top Rated, 100% Job Success Score
`.trim();

export type CvExperience = {
  role: string;
  company: string;
  dates: string;
  location: string;
  summary?: string;
  bullets: string[];
};

export type CvProject = {
  name: string;
  description: string;
};

export const UPWORK_PROFILE_URL = "https://www.upwork.com/freelancers/aakashgoel";

export const UPWORK_PROJECT: CvProject = {
  name: "Upwork",
  description: `${UPWORK_PROFILE_URL} · Top Rated, 100% Job Success Score`,
};

export type CvDocument = {
  name: string;
  title: string;
  contact: string;
  summary: string;
  skills: { label: string; value: string }[];
  experience: CvExperience[];
  projects?: CvProject[];
};
