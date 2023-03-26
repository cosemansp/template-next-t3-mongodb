import { withAuth } from "@/server/auth";
import { odataFetch } from "@/server/fetch";
import type { NextApiRequest, NextApiResponse } from "next";
import type { GraphUser, GraphGroup } from "./types";

type GraphGroupPayload = {
  value: Pick<GraphGroup, "id">[];
};

type GraphMembersPayload = {
  value: Pick<GraphUser, "id" | "displayName" | "mail" | "jobTitle">[];
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // default group: employee
  console.time("graph/members");
  let groupId = "0f8308ae-d7b1-4baf-ad19-94574a636af2";

  // get group name from query param
  const group = req.query.group as string;
  if (group) {
    const groupPayload = await odataFetch<GraphGroupPayload>(
      `https://graph.microsoft.com/v1.0/groups`,
      {
        select: "id",
        filter: `startswith(mail,'${group}')`,
        token: req.nextauth.token.accessToken,
        cacheTime: 60 * 60 /* 1h */,
      }
    );
    if (groupPayload.value.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      groupId = groupPayload.value[0]!.id;
    }
  }

  // get members of group
  const membersPayload = await odataFetch<GraphMembersPayload>(
    `https://graph.microsoft.com/v1.0/groups/${groupId}/members`,
    {
      top: 999,
      select: `id,displayName,mail,jobTitle`,
      token: req.nextauth.token.accessToken,
      cacheTime: 60 * 5 /* 5 min */,
    }
  );

  // filter out any test users
  const members = membersPayload.value
    .filter((member) => !member.jobTitle.includes("Test"))
    .map((member) => {
      // and remove the '@odata.type'
      return {
        ...member,
        "@odata.type": undefined,
      };
    });

  console.timeEnd("graph/members");
  return res.status(200).json(members);
}

export default withAuth(handler);
