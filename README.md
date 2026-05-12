[VENDOOR_README.md](https://github.com/user-attachments/files/27634601/VENDOOR_README.md)
# Vendoor

> A campus ecommerce marketplace built for Nigerian university students.

**Live:** [vendoor.ng](https://vendoor.ng)

---

## What it is

Nigerian university campuses are dense, self-contained economies — students buy and sell everything from textbooks to food to services. But no platform was built with that reality in mind. Vendoor is.

It's a marketplace where students can list products, browse by campus, and transact — with Paystack handling payments natively in Naira, and an admin layer for managing listings, users, and orders.

---

## My role

I own the entire frontend and product architecture. The live backend at `vendoor.ng` is handled by a separate backend developer via API.

---

## Tech Stack

**Frontend**
- React + Vite
- React Router v6
- Zustand (state management)
- Axios (API layer)
- Tailwind CSS
- Paystack (payments)

**Backend** *(separate developer, live API)*
- Node.js + Express
- MongoDB
- JWT Authentication

---

## Key engineering decisions

- **Migrated from Next.js to React + Vite** mid-development — Next.js SSR was adding complexity without benefit for this SPA-style product
- **Zustand over Redux** — lighter, more composable for the scale we needed
- **Admin dashboard rebuilt from scratch** with full async data loaders and TypeScript-safe narrowing after initial implementation had structural issues
- **Paystack integration** for real Naira transactions with webhook handling on the backend

---

## Structure

```
Vendoor/
├── frontend/        # React + Vite app
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── store/       # Zustand stores
│   │   └── api/         # Axios instances
└── server/          # Reference backend (live API at vendoor.ng)
```

---

## Running locally

```bash
cd frontend
npm install
npm run dev
```

Set up a `.env` file with:
```
VITE_API_URL=https://your-backend-url
VITE_PAYSTACK_KEY=your_paystack_public_key
```

---

## Status

Active development. Live at [vendoor.ng](https://vendoor.ng).
