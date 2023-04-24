import { getMeshSDK, Sdk, MyLayout } from "../.mesh";


export default class OryxLayout {
  constructor(
    protected sdk: Sdk = getMeshSDK(),
  ) {}

  async createLayer(revisionHashId: string, position: number, title = "Layer") {
    const newKeys = [];
    for (let i = 0; i < 72; i++) {
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
    const { hashId } = layer.createLayer;
    return new OryxLayoutLayer(hashId, this.sdk);
  }
}

export class LayoutSdk extends OryxLayout {
  constructor(
    public data: MyLayout,
    sdk: Sdk = getMeshSDK(),
  ) {
    super(sdk);
  }

  static async getMine(sdk: Sdk = getMeshSDK()) {
    const { myLayouts } = await sdk.myLayouts_query({});
    return myLayouts.map(l => new LayoutSdk(l, sdk));
  }

  async getNewLayer(title: string = 'New', position?: number) {
    const layers = this.data.revisions[0].layers
    if (layers[position]?.title === title) {
      console.log('Existing layer found:', title);
      return new OryxLayoutLayer(layers[position].hashId, this.sdk);
    } else {
      console.log("Layer", title, "does not exist yet", layers[position]);
    }
    const revisionHashId = this.data.revisions[0].hashId;
    const layerCount = this.data.revisions[0].layers.length;
    return this.createLayer(revisionHashId, position ?? layerCount, title);
  }

  toString() {
    const { title, hashId, revisions } = this.data;
    return `${title} [${hashId}]: ${revisions[0].layers.length} layers [${revisions[0].hashId}]`;
  }
}

export class OryxLayoutLayer {
  constructor(
    public readonly hashId: string,
    private sdk: Sdk = getMeshSDK(),
  ) {}

  setKey(code: string, position: number, customLabel = null) {
    return this.sdk.updateKey_mutation({
      hashId: this.hashId,
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
}
