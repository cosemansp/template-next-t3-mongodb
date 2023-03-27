import { withAuth } from "@/server/auth";
import { fetchQuery, getSecureFetch, stripODataType } from "@/server/fetch";
import type { NextApiRequest, NextApiResponse } from "next";
import type { GraphUser, GraphGroup } from "./types";
import buildODataQuery from "odata-query";

type GraphGroupPayload = {
  value: Pick<GraphGroup, "id">[];
};

type GraphMembersPayload = {
  value: Pick<GraphUser, "id" | "displayName" | "mail" | "jobTitle">[];
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const fetch = getSecureFetch(req);

  // default group: employee
  console.time("graph/members");
  let groupId = "0f8308ae-d7b1-4baf-ad19-94574a636af2";

  // get group id when group expression is specified in query
  const groupExp = req.query.group as string;
  if (groupExp) {
    const groupPayload = await fetchQuery(["groups", groupExp], () => {
      const query = buildODataQuery({
        count: true,
        filter: `startswith(mail,'${groupExp}')`,
        select: "id",
      });
      return fetch<GraphGroupPayload>(
        `https://graph.microsoft.com/v1.0/groups${query}`
      );
    });
    if (groupPayload.value.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      groupId = groupPayload.value[0]!.id;
    }
  }

  // get members of group
  const membersPayload = await fetchQuery(["members", groupId], () => {
    const query = buildODataQuery({
      select: "id,displayName,mail,jobTitle",
    });
    return fetch<GraphMembersPayload>(
      `https://graph.microsoft.com/v1.0/groups/${groupId}/members${query}`
    );
  });

  // filter out any test users
  const members = membersPayload.value
    .filter((member) => !member.jobTitle.includes("Test"))
    .map(stripODataType);

  console.timeEnd("graph/members");
  return res.status(200).json(members);
}

export default withAuth(handler);
