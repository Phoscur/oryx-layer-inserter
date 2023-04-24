import { getMeshSDK } from "../.mesh";
import OryxLayout, { LayoutSdk, OryxLayoutLayer } from "./Layout";

async function test() {
  const sdk = getMeshSDK();
  const myLayouts = await LayoutSdk.getMine();
  console.log(`Found myLayouts(${myLayouts.length}):`); 
  for (const l of myLayouts) {
    console.log(`- ${l}`);
  }
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
  const mine = myLayouts[0];
  // TODO check if it has the correct hash
  //const l = await layout.createLayer(revisionHashId, layerCount, 'Test');
  const position = 5;
  const l = await mine.getNewLayer('Layer', position);
  //console.log("Created Layer:", layerCount, l.hashId, );
  const customLabel = "A", code = "KC_A";
    //hashId = mine.data.revisions[0].layers[position].hashId;
  //const layer = new OryxLayoutLayer(hashId, sdk);
  console.log(customLabel, code, await l.setKey(code, 26, "AAA"));
}
test();
