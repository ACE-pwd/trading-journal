This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Local preview without Supabase

Run `NEXT_PUBLIC_LOCAL_PREVIEW=true npm run dev -- --hostname 127.0.0.1` and visit http://localhost:3000/dashboard.
The development-only preview displays fictional trades and disables saving and authentication.
Trade feedback can be explored in memory. No Supabase configuration is needed.
Stop the server and restart without the preview flag to use the normal Supabase workflow.

## Connected journal and CRUD

The local `.env.local` holds `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; it is ignored by Git. `NEXT_PUBLIC_SUPABASE_ANON_KEY` remains supported for older configurations.

Run `npm run dev -- --hostname 127.0.0.1` for the connected app. Sign in, add a trade, then open it from Journal to edit or delete it. Deletes require confirmation. Updating a trade clears its previous feedback.

`supabase/crud.sql` records the follow-up SQL applied to the existing connected schema. Do not run it twice. It adds ownership checks and feedback invalidation.

Run `node --test tests/trade-form.test.mjs` with Node 22.18+ to check trade validation.
