import { withAuth } from "@/server/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { fetchQuery, getSecureFetch } from "@/server/fetch";
import type { GraphUser } from "../types";
import { omitOData } from "@/utils/odata";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const fetch = getSecureFetch(req);

  console.time("graph/me");

  const profile = await fetchQuery(["me"], () => {
    return fetch<GraphUser>("https://graph.microsoft.com/v1.0/me");
  });

  console.timeEnd("graph/me");
  return res.status(200).json(omitOData(profile));
}

export default withAuth(handler);
