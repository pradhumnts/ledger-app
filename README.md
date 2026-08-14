# Ledger

Simple customer khata + bills for Indian businesses. Built with Next.js, shadcn/ui, and JSX.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What’s included

- **Home** — to-collect total, today / this month summary, recent activity
- **Customers** — name + phone only; chat-style history with You gave / You got
- **Bills** — amount + customer name (existing or create new)
- **Activity** — filtered feed of everything
- **Settings** — business profile, dark mode, share app, about
- **Share** — opens WhatsApp / SMS with a prefilled message (no APIs)

Data is stored in the browser (`localStorage`).
