import type {
  NextApiHandler,
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  Session,
} from "next-auth";
import AzureProvider from "next-auth/providers/azure-ad";
import { type JWT, getToken } from "next-auth/jwt";

import { env } from "@/env.mjs";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

declare module "next" {
  /**
   * Used with withAuth helper is applied to a NextApiHandler
   */
  interface NextApiRequest {
    nextauth: {
      token: JWT;
      session: Session;
    };
  }
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback and `getToken`, when using JWT sessions
   */
  interface JWT {
    // default
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    sub?: string;

    // extended
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    roles: string[];
    id: string;
    iat: number;
    exp: number;
    jti: string;
  }
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop
   * on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    tokenExpiresAt: Date;
    tokenExpiresIn: string;
    user: {
      id: string;
      email: string;
      roles: string[];
    };
  }

  /** Azure AD Account */
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

  /** Azure AD Profile (id_token payload) */
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

type RefreshTokenPayload =
  | {
      token_type: "Bearer";
      scope: string;
      expires_in: number;
      ext_expires_in: number;
      refresh_token: string;
      access_token: string;
      id_token: string;
    }
  | {
      error: string;
      error_description: string;
      error_codes: number[];
      error_uri: string;
    };

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `expiresAt`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      return token;
    }

    const response = await fetch(
      `https://login.microsoftonline.com/${env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: env.AZURE_AD_CLIENT_ID,
          client_secret: env.AZURE_AD_CLIENT_SECRET,
          refresh_token: token.refreshToken,
          scope: "openid profile email offline_access",
        }),
        method: "POST",
      }
    );
    const data: RefreshTokenPayload = await response.json();
    if ("error" in data) {
      throw new Error(`Failed to refresh accessToken: ${data.error}`);
    }
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
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
    if (error instanceof Error) {
      console.error(error.message);
    }

    // throwing the error will cause the session to be invalidated
    // and the user must re-login
    throw error;
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
    maxAge: 1 * 24 * 60 * 60, // 24h - should be the same as the refresh token lifetime
  },
  providers: [
    AzureProvider({
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
      tenantId: env.AZURE_AD_TENANT_ID,
      // idToken: true,
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
      // console.log("jwt", { token });
      // Initial sign in
      if (profile && account) {
        console.log("jwt", {
          accessToken: account?.access_token,
          refreshToken: account?.refresh_token,
        });
        delete user?.image; // lets keep auth cookie small
        const clockSkew = 60 * 10 * 1000; // 10 minutes
        const expiresAt = account.expires_at * 1000 - clockSkew; // ms
        return {
          expiresAt,
          id: token.id,
          iat: token.iat,
          exp: token.exp,
          jti: token.jti,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          roles: profile.roles,
          ...user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.expiresAt) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    session({ session, token }) {
      // console.log("session", { session, token });
      if (session.user) {
        // get time span until token expires
        const date = new Date(0);
        date.setMilliseconds(token.expiresAt - Date.now());
        const timeSpanUntilExpires = date.toISOString().substring(11, 19);

        // create session object
        session.user.id = token.id;
        session.user.roles = token.roles;
        session.tokenExpiresAt = new Date(token.expiresAt);
        session.tokenExpiresIn = timeSpanUntilExpires;
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

/**
 *
 * @param Helper function to wrap a NextApiHandler with authentication
 * and throws an 401 error when not authenticated
 *
 * Usage:
 * ```
 * const handler = (req: NextApiRequest) => {
 *   const { token } = req.nextauth;
 * }));
 *
 * export default withAuth(handler, 'admin');
 * ```
 */
export const withAuth = (handler: NextApiHandler, role?: string) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // we need to get the session here to refresh the token
    const session = await getServerAuthSession({ req, res });
    const token = await getToken({ req });

    // must have token
    if (!token || !session) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized",
      });
    }

    // when role is provided, must user have role
    if (role && !token.roles.includes(role)) {
      return res.status(403).json({
        status: 403,
        message: "Forbidden",
        error: `User does not have required role: '${role}'`,
      });
    }

    // augment request with token
    req.nextauth = {
      token,
      session,
    };

    try {
      // call handler
      return await handler(req, res);
    } catch (err) {
      // handle all errors
      if (err instanceof Error) {
        return res.status(500).json({
          status: 500,
          message: "Internal Server Error",
          // TODO: remove details in production
          details: {
            error: err.message,
            cause: err.cause,
          },
        });
      }
      throw err;
    }
  };
};
