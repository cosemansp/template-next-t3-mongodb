# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## Quick Start

```bash
# DB commands
pnpm run db:up     # start the database
pnpm run db:down   # stop the database
pnpm run db:init   # initialize the DB as cluster (one time only)
pnpm run db:sync   # create collections in db

# generate prisma client when the schema.prisma is changed
pnpm prisma generate

# open prisma studio (access db via web interface)
pnpm prisma studio

# start development server
pnpm dev 

# Unit tests
pnpm vitest
```

## TRPC Panel

The TRPC Panel is a web interface that allows you to inspect your TRPC endpoints and their data. It is available in development mode only.

You can access the TRPC panel at [http://localhost:3000/api/panel](http://localhost:3000/api/panel).

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
