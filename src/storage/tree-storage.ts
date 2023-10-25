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
  #currentRoot: Hash;

  private constructor(
    private readonly _collection: Collection<any>,
    private readonly _prefix: Bytes,
    private readonly _prefixHash: string,
    currentRoot: Hash
  ) {
    this.#currentRoot = currentRoot;
  }

  public static async setup(prefix: Bytes, _collection: Collection<any>): Promise<MongoDBStorage> {
    const prefixHash = bytes2Hex(prefix);
    const rootObj = await _collection.findOne({ key: prefixHash });
    let currentRoot: Hash;
    if (rootObj) {
      const value: any = JSON.parse(rootObj.value);
      currentRoot = Hash.fromString(value);
    } else {
      currentRoot = ZERO_HASH;
    }
    return new MongoDBStorage(_collection, prefix, prefixHash, currentRoot);
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
      const cL = Hash.fromString(obj.childL);
      const cR = Hash.fromString(obj.childR);
      return new NodeMiddle(cL, cR);
    }
    if (obj.type === NODE_TYPE_LEAF) {
      const k = Hash.fromString(obj.entry[0]);
      const v = Hash.fromString(obj.entry[1]);

      return new NodeLeaf(k, v);
    }
    throw new Error(`error: value found for key ${key} is not of type Node`);
  }

  async put(k: Bytes, n: Node): Promise<void> {
    const kBytes = new Uint8Array([...this._prefix, ...k]);
    const key = bytes2Hex(kBytes);
    await this._collection.findOneAndDelete({ key: key });
    await this._collection.insertOne({ key: key, value: JSON.stringify(n) });
  }

  async getRoot(): Promise<Hash> {
    return this.#currentRoot;
  }

  async setRoot(r: Hash): Promise<void> {
    await this._collection.findOneAndDelete({ key: this._prefixHash });
    await this._collection.insertOne({ key: this._prefixHash, value: JSON.stringify(r) });
    this.#currentRoot = r;
  }
}
