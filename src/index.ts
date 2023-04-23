import { execute, getMeshSDK } from '../.mesh'
 
const gql = /* GraphQL */ `
query getLayout($hashId: String!, $revisionId: String!, $geometry: String) {
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
`
 
const variables = {
  "geometry": "moonlander",
  "hashId": "PqjlE",
  "revisionId": "latest"
};
 
async function main() {
  const result = await execute(gql, variables)
  console.log(result)
}
//main()

async function test() {
  // Load mesh config and get the sdkClient from it
  const sdk = getMeshSDK()
 
  // Execute `myQuery` and get a type-safe result
  // Variables and result are typed: { getSomething: { fieldA: string, fieldB: number }, errors?: GraphQLError[] }
  const { myLayouts } = await sdk.myLayouts_query({})
  console.log('layouts', myLayouts.length, myLayouts[0].revisions[0].layers[5])
  //const hashId = myLayouts[0].revisions[0].hashId
  //console.log('latest revision hash', hashId)
  const customLabel = "A", code = "KC_A", hashId = myLayouts[0].revisions[0].layers[5].hashId
  console.log(customLabel, code, await sdk.updateKey_mutation({
    hashId,
    keyData: {
        about: null,
        aboutPosition: null,
        glowColor: null,
        customLabel,
        tappingTerm: null,
        tap: {
            description: null,
            code,
            color: null,
            modifier: null,
            modifiers: null,
            layer: null,
            macro: null,
        },
        hold: null,
        doubleTap: null,
        tapHold: null,
        icon: null,
        emoji: null,
    },
    position: 25,
  }))

}
test()