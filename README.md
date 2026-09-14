# PantryPal

PantryPal is a personal kitchen dashboard built to make the boring parts of meal planning easier: checking what you already have, spotting ingredients about to expire, and getting a good idea for dinner without overthinking it.

The app is designed to feel more like a thoughtful kitchen tool than a cluttered inventory app. It blends a pantry overview, smart recipe suggestions, shopping list tracking, and a lightweight meal-history layer that helps surface recommendations based on what you tend to cook.

Live preview:
https://pantry-pal-1x3c-1v7fjflzf-gao-86a4.vercel.app/

## What it does

- Tracks pantry items and their expiration status
- Highlights items that are fresh, low, expiring, or expired
- Recommends recipes based on pantry overlap and recent meal habits
- Lets you add food preferences and keep a meal history
- Supports a shopping list for missing ingredients
- Includes custom recipe creation flows
- Uses OpenAI for smarter meal suggestions when an API key is available

## Product feel

This app is meant to be simple, calm, and useful in a real kitchen environment. The interface leans warm, soft, and clean rather than noisy or app-heavy, which makes it easier to glance at while cooking or meal planning.

## Tech stack

- Next.js 16
- React 19
- Tailwind CSS
- Prisma ORM
- PostgreSQL-ready schema
- OpenAI API integration
- Vitest + ESLint for validation

## Project structure

```text
app/
├── app/
│   ├── api/
│   ├── inventory/
│   ├── recipes/
│   ├── shopping/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
├── prisma/
├── public/
├── package.json
├── vitest.config.ts
├── vitest.setup.ts
└── README.md
```

## Local setup

Install dependencies:

```bash
npm install
```

Start the app locally:

```bash
npm run dev
```

Open http://localhost:3000 in the browser.

## Environment variables

Copy the example environment file if needed and adjust values for your setup:

```bash
cp .env.example .env.local
```

The app supports optional AI recommendations through OpenAI:

```env
OPENAI_API_KEY=your_key_here
```

If no key is present, the app falls back to a practical recommendation based on pantry items and recent meal patterns.

## Useful scripts

```bash
npm run dev
npm run build
npm run lint
npm run test -- --run
npm run db:generate
npm run db:push
npm run db:seed
```

## Notes

This project is intentionally built to work well without a live database while still being ready for a Postgres-backed setup. That makes it easy to use locally for demos and iteration, while keeping the path open for deployment and real data persistence later on.

## License

This project is for personal use and experimentation.

