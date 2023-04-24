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
        privacy
        geometry
        hashId
        parent {
          hashId
          __typename
        }
        tags {
          id
          hashId
          name
          __typename
        }
        title
        user {
          annotation
          annotationPublic
          name
          hashId
          pictureUrl
          __typename
        }
        revision {
          ...RevisionData
          __typename
        }
        lastRevisionCompiled
        isLatestRevision
        __typename
      }

      fragment RevisionData on Revision {
        createdAt
        hashId
        hexUrl
        model
        title
        config
        swatch
        zipUrl
        qmkVersion
        qmkUptodate
        md5
        combos {
          keyIndices
          layerIdx
          name
          trigger
          __typename
        }
        tour {
          ...TourData
          __typename
        }
        layers {
          builtIn
          hashId
          keys
          position
          title
          color
          prevHashId
          __typename
        }
        __typename
      }

      fragment TourData on Tour {
        hashId
        url
        steps: tourSteps {
          hashId
          intro
          outro
          position
          content
          keyIndex
          layer {
            hashId
            position
            __typename
          }
          __typename
        }
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
