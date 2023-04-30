import type { Layer as LayerBaseType } from "../.mesh";
import { getMeshSDK, Sdk, MyLayout } from "../.mesh";
import storage from "node-persist";

export type KeyAction = {
  code: string;
  color: string | null;
  layer: null; // TODO?
  macro: null; // TODO
  modifier: null;
  modifiers: null;
  description: string | null;
}

export type LayerKey = {
  about: string | null;
  aboutPosition: string | null;
  customLabel: string | null;
  doubleTap: KeyAction | null;
  emoji: string | null;
  glowColor: string | null;
  hold: KeyAction | null;
  icon: string | null;
  tap: KeyAction | null;
  tapHold: KeyAction | null;
};

/**
 * LayerBaseType override for better keys attribute typing
 */
export interface Layer extends LayerBaseType {
  keys: LayerKey[];
}

export class OryxLayout {
  constructor(protected sdk: Sdk = getMeshSDK()) {}

  async createLayer(revisionHashId: string, position: number, newKeys: LayerKey[] = [], title = "Layer") {
    while (newKeys.length < 72) { // TODO? use layout geometry attribute to derive keycount
      newKeys.push({
        about: null,
        aboutPosition: null,
        customLabel: null,
        doubleTap: null,
        emoji: null,
        glowColor: null,
        hold: null,
        icon: null,
        tap: null,
        tapHold: null,
      });
    }
    const layer = await this.sdk.createLayer_mutation({
      newKeys,
      revisionHashId,
      position,
      title,
    });
    return layer.createLayer;
  }
}

export default class MyLayoutSdk extends OryxLayout {
  public layers: LayerSdk[];
  constructor(public data: MyLayout, sdk: Sdk = getMeshSDK()) {
    super(sdk);
    this.layers = this.data.revisions[0].layers.map(l => new LayerSdk(l as Layer, sdk));
  }

  static async getMine(sdk: Sdk = getMeshSDK()) {
    const { myLayouts } = await sdk.myLayouts_query({});
    await storage.setItem("myLayouts", myLayouts);
    return myLayouts.map((l) => new MyLayoutSdk(l, sdk));
  }

  static async fromStorage(sdk: Sdk = getMeshSDK()): Promise<MyLayoutSdk[]> {
    const myLayouts = await storage.getItem("myLayouts");
    return myLayouts.map((l) => new MyLayoutSdk(l, sdk));
  }

  // TODO? split out getExistingLayer
  async getNewLayer(title: string = "New", position?: number) {
    const layers = this.data.revisions[0].layers as Layer[];
    if (layers[position]?.title === title) {
      console.log("Existing layer found:", title);
      return new LayerSdk(layers[position], this.sdk);
    } else {
      console.log("Layer", title, "does not exist yet", position, layers[position]);
    }
    const revisionHashId = this.data.revisions[0].hashId;
    const layerCount = this.data.revisions[0].layers.length;
    const { hashId } = await this.createLayer(revisionHashId, position ?? layerCount, [], title);
    console.log("Created new layer:", hashId);
    const { myLayouts } = await this.sdk.myLayouts_query();
    await storage.setItem("myLayouts", myLayouts);
    this.data = myLayouts.find((l) => l.hashId === this.data.hashId);
    const layer = new LayerSdk(this.data.revisions[0].layers.find((l) => l.hashId === hashId) as Layer, this.sdk);
    if (!this.data || !layer) {
      console.log("Layer", layer);
      console.log("Layout", this.data);
      throw new Error(`Failed to create new Layer "${title}" [${hashId}]`);
    }
    return layer;
  }

  toString() {
    const { title, hashId, revisions } = this.data;
    return `${title} [${hashId}]: ${revisions[0].layers.length} layers [${revisions[0].hashId}] (${this.layersList.join(", ")})`;
  }

  get layersList() {
    return this.layers.map(l => l.toString());
  }
}

export class LayerSdk {
  constructor(public readonly data: Layer, private sdk: Sdk = getMeshSDK()) {}

  setKey(code: string, position: number, customLabel = null) {
    return this.sdk.updateKey_mutation({
      hashId: this.data.hashId,
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
      position,
    });
  }

  toString() {
    return `${this.data.title}`;// [${this.data.hashId}]`;// ${this.keysAsString}`;
  }

  get keysAsString() {
    return `[${this.data.hashId}]: ${this.data.keys.map(k => {
      if (k.customLabel) {
        return k.customLabel;
      }
      if (!k.tap) {
        return `•`
      }
      const code = k.tap.code.replace("KC_", "")
      if (code === "TRANSPARENT") {
        return " ";
      }
      return code;
    }).join(" ")}`;
  }
}
