import { withAuth } from "@/server/auth";
import { odataFetch } from "@/server/fetch";
import type { NextApiRequest, NextApiResponse } from "next";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.time("graph/me");
  const profile = await odataFetch("https://graph.microsoft.com/v1.0/me", {
    cacheTime: 60 * 5 /* sec */,
    token: req.nextauth.token.accessToken,
  });
  console.timeEnd("graph/me");
  return res.status(200).json(profile);
}

export default withAuth(handler);
