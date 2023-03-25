import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import AzureProvider from "next-auth/providers/azure-ad";
import { env } from "@/env.mjs";
import type { JWT } from "next-auth/jwt";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    tokenExpires: Date;
    user: {
      id: string;
      email: string;
      roles: string[];
    };
  }

  // Azure AD Account
  interface Account {
    provider: string;
    providerAccountId: string;
    token_type: "Bearer";
    scope: string;
    expires_at: number;
    ext_expires_in: number;
    access_token: string;
    id_token: string;
    session_state: string;
  }

  // Azure AD Profile (id_token payload)
  interface Profile {
    aud: string;
    iss: string; // https://login.microsoftonline.com/0b53d2c1-bc55-4ab3-a161-927d289257f2/v2.0
    iat: number;
    nbf: number;
    exp: number;
    aio: string;
    oid: string;
    preferred_username: string;
    rh: string;
    roles: string[];
    tid: string;
    uti: string;
    ver: "2.0";
  }
}

type RefreshTokenPayload = {
  token_type: "Bearer";
  scope: string;
  expires_in: number;
  ext_expires_in: number;
  refresh_token: string;
  access_token: string;
  id_token: string;
};

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `expiresAt`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(
      `https://login.microsoftonline.com/${env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: env.AZURE_AD_CLIENT_ID,
          client_secret: env.AZURE_AD_CLIENT_SECRET,
          refresh_token: token.refreshToken as string,
          scope: "openid profile email offline_access",
        }),
        method: "POST",
      }
    );
    const data: RefreshTokenPayload = await response.json();
    console.log(">>>>>>>>>>>> REFRESH TOKEN >>>>>>");
    console.log(data);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      refreshToken: data.refresh_token,
    };
  } catch (error) {
    console.error("Failed to refresh accessToken", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

/**
 * Options for NextAuth.js
 * Used in pages/api/auth/[...nextauth].ts
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  debug: false,
  session: {
    maxAge: 1 * 24 * 60 * 60,
  },
  providers: [
    AzureProvider({
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
      tenantId: env.AZURE_AD_TENANT_ID,
      idToken: true,
      checks: ["pkce"], // to prevent CSRF and authorization code injection attacks.
      authorization: {
        params: {
          scope:
            "openid profile email offline_access Group.Read.All User.Read.All Directory.Read.All",
        },
      },
    }),
  ],
  callbacks: {
    jwt({ token, account, user, profile }) {
      // console.log("jwt", { token, account, profile });
      // Initial sign in
      if (profile && account) {
        delete user?.image; // lets keep auth cookie small
        return {
          accessToken: account.access_token,
          expiresAt: account.expires_at * 1000,
          refreshToken: account.refresh_token,
          roles: profile.roles,
          ...user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    session({ session, token }) {
      // console.log("session", { session, token });
      if (session.user) {
        session.tokenExpires = new Date(token.expiresAt as number);
        session.user.id = token.sub as string;
        session.user.roles = token.roles as string[];
      }
      return session;
    },
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
