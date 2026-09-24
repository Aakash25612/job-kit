# Job Kit

Two screens for job applications, powered by your base full stack CV and OpenAI.

1. **CV Builder** (`/cv`) - paste a job description, get a tailored CV, download PDF
2. **Answer Questions** (`/answer`) - paste a form question, get a short human answer

No separate backend. Next.js API routes call OpenAI on Vercel.

## Setup

```bash
npm install
cp .env.example .env.local
# put your key in .env.local as GPT_API_KEY=...
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Vercel

1. Import this repo in Vercel
2. Add env var `GPT_API_KEY` with your OpenAI key
3. Deploy

That is all. Build command is `npm run build`, output is the default Next.js app.

## Notes

- Base CV is embedded from `Aakash_Goel_CV_FullStack_AI.pdf` in `src/lib/cv.ts`
- Outputs avoid em dashes
- Answers stay short unless you add a length note
- PDF is generated in the browser with jsPDF after the tailored CV JSON returns
