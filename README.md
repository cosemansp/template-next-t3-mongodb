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

## Microsoft Graph API

See more at [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer).

```bash
# my profile
https://graph.microsoft.com/v1.0/me

# profile photo
https://graph.microsoft.com/v1.0/me/photo/$value

# groups in organizations
https://graph.microsoft.com/v1.0/groups

# group members
https://graph.microsoft.com/v1.0/groups/0f8308ae-d7b1-4baf-ad19-94574a636af2/members?$count=true&$top=5
```

## Next/Auth

Client side (in pages)

```js
// is only available in client side
// see also the <SessionProvider /> in _app.tsx
const { data } = useSession();
```

Server side (in pages/api)

```js
const session = await getServerSession({ req, res, authOptions });
const session = await getServerAuthSession({ req, res });
const token = await getToken({ req });
```

## Azure AD security

### Token expiration

Access tokens lifetime is assigned a random value ranging between 60-90 minutes. The lifetime of a refresh token is 24 hours.

Refresh tokens can be revoked at any time, because of timeouts and revocations. Your app must handle rejections by the sign-in service gracefully when this occurs. See https://learn.microsoft.com/en-us/azure/active-directory/develop/refresh-tokens#revocation


Refresh token request failure

```json
{
  error: 'invalid_grant',
  error_description: 'AADSTS9002313: Invalid request. Request is malformed or invalid.\r\n' +
    'Trace ID: 4bb33602-b1ab-4f79-a93e-895ea5d92800\r\n' +
    'Correlation ID: c48ce8b3-1210-497a-b21e-b74ec101c2b2\r\n' +
    'Timestamp: 2023-03-26 11:22:17Z',
  error_codes: [ 9002313 ],
  timestamp: '2023-03-26 11:22:17Z',
  trace_id: '4bb33602-b1ab-4f79-a93e-895ea5d92800',
  correlation_id: 'c48ce8b3-1210-497a-b21e-b74ec101c2b2',
  error_uri: 'https://login.microsoftonline.com/error?code=9002313'
}
```