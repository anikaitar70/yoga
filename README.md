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
## Backend architecture

This project now includes a PostgreSQL backend using Prisma ORM.

### Setup

1. Copy `.env.example` to `.env`
2. Update `DATABASE_URL` with your PostgreSQL credentials
3. Install dependencies:

```bash
npm install
```

4. Push the Prisma schema to the database:

```bash
npm run db:push
```

5. Seed the database with starter records:

```bash
npm run db:seed
```
5. Set an admin secret in `.env`:

```env
ADMIN_SECRET="your-admin-secret"
```

6. Open the admin dashboard at `/admin` and sign in with the secret.
### Available API routes

- `GET /api/events`
- `POST /api/events`
- `GET /api/events/:id`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `GET /api/blogs`
- `POST /api/blogs`
- `GET /api/blogs/:id`
- `PUT /api/blogs/:id`
- `DELETE /api/blogs/:id`
- `GET /api/users`
- `POST /api/users`
- `POST /api/newsletter`
- `GET /api/newsletter`
- `GET /api/gallery`
- `POST /api/gallery`
- `POST /api/contact`
## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
