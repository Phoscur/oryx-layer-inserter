import { getMeshSDK } from "../.mesh";
import MyLayoutSdk from "./Layout";
import prompts from "prompts";
import storage from "node-persist";
prompts.override(require('yargs').argv);

if (!process.env.TOKEN) {
  console.log("Please set a authentication TOKEN in the .env-file first");
  process.exit(1);
}


async function selectLayouts(myLayouts: MyLayoutSdk[]): Promise<{
  layout: MyLayoutSdk,
  source: MyLayoutSdk,
}> {
  const layout = myLayouts.find(l => l.data.hashId === process.env.PRESELECT_LAYOUT);
  const source = myLayouts.find(l => l.data.hashId === process.env.PRESELECT_SOURCE_LAYOUT);

  if (layout || source) {
    prompts.override({ layout, source });
  }

  return prompts([
    {
      type: 'select',
      name: 'layout',
      message: `Which layout are we working on?`,
      choices: myLayouts.map(l => ({
        title: `${l.data.title} [${l.data.hashId}]`,
        value: l,
        description: l.layers.map(layer => `${layer} ${layer.keysAsString}`).join("\n"),
      })),
    },
    {
      type: 'select',
      name: 'source',
      message: 'Pick source layout',
      choices: myLayouts.map(l => ({
        title: `${l.data.title} [${l.data.hashId}]`,
        value: l,
        description: l.layers.map(layer => `${layer} ${layer.keysAsString}`).join("\n"),
      }))
    }
  ]);
}

(async function main() {
  await storage.init({ dir: "storage" });
  const values = await storage.values();
  console.log(values.length > 0 ? `Found & using cached layouts!` : `Layout Cache is empty.`);
  const sdk = getMeshSDK();
  // TODO refresh storage on demand & timeout?
  const myLayouts = await (values.length > 0 ? MyLayoutSdk.fromStorage(sdk) : MyLayoutSdk.getMine(sdk));
  console.log(`Found myLayouts (${myLayouts.length}):`); 
  for (const l of myLayouts) {
    console.log(`- ${l}\n`);
  }
  const { layout, source } = await selectLayouts(myLayouts);

  const response = await prompts([
    {
      type: 'select',
      name: 'layer',
      message: 'Pick source layer',
      choices: source.layers.map(layer => ({
        title: layer.data.title,
        value: layer,
        description: `${layer.keysAsString}`
      }))
    }
  ]);

  console.log(`Selected Layer: ${response.layer}`);

  //const revisionHashId = myLayouts[0].revisions[0].hashId, layerCount = myLayouts[0].revisions[0].layers.length;
  //console.log(myLayouts[0].title, "latest revision hash", revisionHashId);
  // console.log("layer 5", myLayouts[0].revisions[0].layers[5]);
  /*const variables = {
    keys: [],
    position: 5,
    revisionHashId: "66RPR",
    title: "Layer",
  };*/
  //const layout = new OryxLayout(sdk);
  //const mine = myLayouts[0];
  // TODO check if it has the correct hash & if lastRevisionCompiled / isLatestRevision
  //const l = await layout.createLayer(revisionHashId, layerCount, 'Test');
  //const position = 6;
  //const l = await mine.getNewLayer('UwU', position);
  //console.log("Created Layer:", layerCount, l.hashId, );
  //const customLabel = "A", code = "KC_A";
  //hashId = mine.data.revisions[0].layers[position].hashId;
  //const layer = new OryxLayoutLayer(hashId, sdk);
  //console.log(customLabel, code, await l.setKey(code, 26, "AAA"));
})();
