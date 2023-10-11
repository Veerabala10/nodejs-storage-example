import { Merkletree, str2Bytes } from '@iden3/js-merkletree';
import * as uuid from 'uuid';

import {
  IdentityMerkleTreeMetaInformation,
  IMerkleTreeStorage,
  MerkleTreeType
} from '@0xpolygonid/js-sdk';
import { MongoDataSource } from './data-source';
import { MongoDBStorageFactory } from './data-source-factory';

export const MERKLE_TREE_TYPES: MerkleTreeType[] = [
  MerkleTreeType.Claims,
  MerkleTreeType.Revocations,
  MerkleTreeType.Roots
];

/**
 * Merkle tree storage that uses mongo db storage
 *
 * @public
 * @class MerkleTreeMongodDBStorage
 * @implements implements IMerkleTreeStorage interface
 */
export class MerkleTreeMongodDBStorage implements IMerkleTreeStorage {
  /**
   * Creates an instance of MerkleTreeIndexedDBStorage.
   * @param {number} _mtDepth
   * @param {MongoDataSource<any>} _merkleTreeMetaStore
   * @param {MongoDataSource<any>} _bindingStore
   */
  constructor(
    private readonly _mtDepth: number,
    private readonly _merkleTreeMetaStore: MongoDataSource<any>,
    private readonly _bindingStore: MongoDataSource<any>,
    private readonly _treeStorageMongoConnectionURL: string
  ) {}

  /** creates a tree in the indexed db storage */
  async createIdentityMerkleTrees(
    identifier: string
  ): Promise<IdentityMerkleTreeMetaInformation[]> {
    if (!identifier) {
      identifier = `${uuid.v4()}`;
    }
    const existingBinging = await this._bindingStore.get(identifier);
    if (existingBinging) {
      throw new Error(
        `Present merkle tree meta information in the store for current identifier ${identifier}`
      );
    }

    const createMerkleTreeMetaInfo = (identifier: string): IdentityMerkleTreeMetaInformation[] => {
      const treesMeta: IdentityMerkleTreeMetaInformation[] = [];
      for (let index = 0; index < MERKLE_TREE_TYPES.length; index++) {
        const mType = MERKLE_TREE_TYPES[index];
        const treeId = `${identifier}+${mType}`;
        treesMeta.push({ treeId, identifier, type: mType });
      }
      return treesMeta;
    };

    const treesMeta = createMerkleTreeMetaInfo(identifier);
    console.log('treesMeta: ' + JSON.stringify(treesMeta));
    await this._merkleTreeMetaStore.save(identifier, { meta: JSON.stringify(treesMeta) }, 'identifier');
    return treesMeta;
  }
  /**
   *
   * getIdentityMerkleTreesInfo from the mongo db storage
   * @param {string} identifier
   * @returns `{Promise<IdentityMerkleTreeMetaInformation[]>}`
   */
  async getIdentityMerkleTreesInfo(
    identifier: string
  ): Promise<IdentityMerkleTreeMetaInformation[]> {
    const meta = await this._merkleTreeMetaStore.get(identifier, 'identifier');
    if (meta && meta.meta) {
      return JSON.parse(meta.meta);
    }
    throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
  }

  /** get merkle tree from the mongo db storage */
  async getMerkleTreeByIdentifierAndType(
    identifier: string,
    mtType: MerkleTreeType
  ): Promise<Merkletree> {
    let meta = await this._merkleTreeMetaStore.get(identifier, 'identifier');
    const err = new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
    if (!meta) {
      throw err;
    }

    meta = JSON.parse(meta.meta);

    const resultMeta = meta.find(
      (m: { identifier: string; type: MerkleTreeType }) =>
        m.identifier === identifier && m.type === mtType
    );
    if (!resultMeta) {
      throw err;
    }

    const mongoDBTreeStorage = await MongoDBStorageFactory(
      str2Bytes(resultMeta.treeId),
      this._treeStorageMongoConnectionURL
    );
    return new Merkletree(mongoDBTreeStorage, true, this._mtDepth);
  }
  /** adds to merkle tree in the mongo db storage */
  async addToMerkleTree(
    identifier: string,
    mtType: MerkleTreeType,
    hindex: bigint,
    hvalue: bigint
  ): Promise<void> {
    let meta = await this._merkleTreeMetaStore.get(identifier, 'identifier');
    if (!meta || !meta.meta) {
      throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
    }
    console.log('addToMerkleTree:' + meta.meta);
    meta = JSON.parse(meta.meta);
    const resultMeta = meta.find(
      (m: { identifier: string; type: MerkleTreeType }) =>
        m.identifier === identifier && m.type === mtType
    );
    if (!resultMeta) {
      throw new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
    }

    const mongoDBTreeStorage = await MongoDBStorageFactory(
      str2Bytes(resultMeta.treeId),
      this._treeStorageMongoConnectionURL
    );
    const tree = new Merkletree(mongoDBTreeStorage, true, this._mtDepth);

    await tree.add(hindex, hvalue);
  }

  /** binds merkle tree in the mongo db storage to the new identifiers */
  async bindMerkleTreeToNewIdentifier(oldIdentifier: string, newIdentifier: string): Promise<void> {
    let meta = await this._merkleTreeMetaStore.get(oldIdentifier, 'identifier');
    if (!meta || !meta?.meta.length) {
      throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
    }

    meta = JSON.parse(meta.meta);

    const treesMeta = meta.map((m: { identifier: string; type: MerkleTreeType }) => ({
      ...m,
      identifier: newIdentifier
    }));

    await this._merkleTreeMetaStore.delete(oldIdentifier, 'identifier');
    console.log('bindMerkleTreeToNewIdentifier: ' +  JSON.stringify(treesMeta));
    await this._merkleTreeMetaStore.save(newIdentifier, { meta: JSON.stringify(treesMeta) }, 'identifier');
    await this._bindingStore.save(oldIdentifier, newIdentifier);
  }

}
