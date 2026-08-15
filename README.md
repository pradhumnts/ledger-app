# MoneyKit

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

## Install as an app (PWA)

MoneyKit is a Progressive Web App. After deploying:

1. Open the site in **Chrome** (Android) or **Safari** (iOS).
2. Use **Install app** / **Add to Home Screen**.
3. The app opens full-screen with your khata data available offline (cached shell + local storage).

Production builds generate a service worker automatically (`npm run build` uses webpack for PWA support).
