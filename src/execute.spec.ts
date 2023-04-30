import { describe, it, expect } from "@jest/globals";
import { execute } from "../.mesh";

describe("GraphQL Mesh", () => {
  it("should execute(any graphql)", async () => {
    const gql = /* GraphQL */ `
      query getLayout(
        $hashId: String!
        $revisionId: String!
        $geometry: String
      ) {
        layout(hashId: $hashId, geometry: $geometry, revisionId: $revisionId) {
          ...LayoutData
          __typename
        }
      }

      fragment LayoutData on Layout {
        title
        lastRevisionCompiled
        isLatestRevision
        __typename
      }
    `;

    const variables = {
      geometry: "moonlander",
      hashId: "PqjlE",
      revisionId: "latest",
    };

    const result = await execute(gql, variables);
    expect(result.data.layout.title).toEqual("neophumb");
  });
});
