import { withAuth } from "@/server/auth";
import { getSecureFetch } from "@/server/fetch";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const fetch = getSecureFetch(req);

  console.time("graph/me/photo");
  const photoBlob = await fetch<Blob>(
    "https://graph.microsoft.com/v1.0/me/photo/$value"
  );

  const arrayBuffer = await photoBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  res.setHeader("Content-Type", "image/jpeg");
  res.status(200).send(buffer);

  console.timeEnd("graph/me/photo");
};

export default withAuth(handler);
