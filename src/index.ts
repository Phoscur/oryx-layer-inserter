import { getMeshSDK } from "../.mesh";
import MyLayoutSdk, { LayerSdk } from "./Layout";
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

async function selectLayer(source: MyLayoutSdk): Promise<{layer: LayerSdk}> {
  return prompts([
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
}

(async function main() {
  await storage.init({ dir: "storage" });
  const values = await storage.values();
  console.log(values.length > 0 ? `Found & using cached layouts!` : `Layout Cache is empty.`);
  const sdk = getMeshSDK();
  // TODO? refresh storage on demand & timeout
  const myLayouts = await (values.length > 0 ? MyLayoutSdk.fromStorage(sdk) : MyLayoutSdk.getMine(sdk));
  console.log(`Found myLayouts (${myLayouts.length}):`); 
  for (const l of myLayouts) {
    console.log(`- ${l}`);
  }
  const { layout, source } = await selectLayouts(myLayouts);

  const { layer } = await selectLayer(source);

  console.log(`Selected Layer: ${layer}`);

  const revision = layout.data.revisions[0];
  // TODO? check if it has the correct hash & if lastRevisionCompiled / isLatestRevision
  const l = await layout.createLayer(revision.hashId, revision.layers.length, layer.data.keys, layer.data.title);
  console.log("Created Layer:", revision.layers.length, l.hashId);
  //const customLabel = "A", code = "KC_A";
  //console.log(customLabel, code, await l.setKey(code, 26, "AAA"));
})();
