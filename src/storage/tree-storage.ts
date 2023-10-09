import {
  Bytes,
  bytes2Hex,
  Hash,
  ITreeStorage,
  Node,
  NodeEmpty,
  NodeLeaf,
  NodeMiddle,
  NODE_TYPE_EMPTY,
  NODE_TYPE_LEAF,
  NODE_TYPE_MIDDLE,
  ZERO_HASH
} from '@iden3/js-merkletree';
import { Collection } from 'mongodb';

export class MongoDBStorage implements ITreeStorage {
  private readonly _prefixHash: string;

  #currentRoot: Hash;

  constructor(private readonly _prefix: Bytes, private readonly _collection: Collection<any>) {
    this.#currentRoot = ZERO_HASH;
    this._prefixHash = bytes2Hex(_prefix);
  }

  async get(k: Bytes): Promise<Node | undefined> {
    const kBytes = new Uint8Array([...this._prefix, ...k]);
    const key = bytes2Hex(kBytes);
    let obj = (await this._collection.findOne({ key: key })).value;
    if (obj === null || obj === undefined) {
      return undefined;
    }
    obj = JSON.parse(obj);
    if (obj.type === NODE_TYPE_EMPTY) {
      return new NodeEmpty();
    }
    if (obj.type === NODE_TYPE_MIDDLE) {
      const cL = new Hash(Uint8Array.from(Object.values(obj.childL.bytes)));
      const cR = new Hash(Uint8Array.from(Object.values(obj.childR.bytes)));
      return new NodeMiddle(cL, cR);
    }
    if (obj.type === NODE_TYPE_LEAF) {
      const k = new Hash(Uint8Array.from(Object.values(obj.entry[0].bytes)));
      const v = new Hash(Uint8Array.from(Object.values(obj.entry[1].bytes)));

      return new NodeLeaf(k, v);
    }
    throw new Error(`error: value found for key ${key} is not of type Node`);
  }

  async put(k: Bytes, n: Node): Promise<void> {
    const kBytes = new Uint8Array([...this._prefix, ...k]);
    const key = bytes2Hex(kBytes);
    await this._collection.insertOne({ key: key, value: JSON.stringify(n) });
  }

  async getRoot(): Promise<Hash> {
    if (!this.#currentRoot.equals(ZERO_HASH)) {
      return this.#currentRoot;
    }
    const root = await this._collection.findOne({ key: this._prefixHash });

    if (!root) {
      this.#currentRoot = ZERO_HASH;
    } else {
      let bytes = root.bytes ? Object.values(root.bytes) : root.bytes;
      this.#currentRoot = new Hash(bytes);
    }
    return this.#currentRoot;
  }

  async setRoot(r: Hash): Promise<void> {
    await this._collection.insertOne({ key: this._prefixHash, value: JSON.stringify(r) });
    this.#currentRoot = r;
  }
}
