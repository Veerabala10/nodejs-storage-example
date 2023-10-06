import { IndexedDBStorage, Merkletree, str2Bytes } from '@iden3/js-merkletree';
import * as uuid from 'uuid';

import {
  IdentityMerkleTreeMetaInformation,
  IMerkleTreeStorage,
  MerkleTreeType
} from '@0xpolygonid/js-sdk';
import { MongoDataSource } from './data-source';

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
    private readonly _bindingStore: MongoDataSource<any>
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
    await this._merkleTreeMetaStore.save(identifier, treesMeta);
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
    const meta = await this._merkleTreeMetaStore.get(identifier);
    if (meta) {
      return meta;
    }
    throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
  }

  /** get merkle tree from the mongo db storage */
  async getMerkleTreeByIdentifierAndType(
    identifier: string,
    mtType: MerkleTreeType
  ): Promise<Merkletree> {
    const meta = await this._merkleTreeMetaStore.get(identifier);
    const err = new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
    if (!meta) {
      throw err;
    }

    const resultMeta = meta.find(
      (m: { identifier: string; type: MerkleTreeType }) =>
        m.identifier === identifier && m.type === mtType
    );
    if (!resultMeta) {
      throw err;
    }
    return new Merkletree(new IndexedDBStorage(str2Bytes(resultMeta.treeId)), true, this._mtDepth);
  }
  /** adds to merkle tree in the mongo db storage */
  async addToMerkleTree(
    identifier: string,
    mtType: MerkleTreeType,
    hindex: bigint,
    hvalue: bigint
  ): Promise<void> {
    const meta = await this._merkleTreeMetaStore.get(identifier);
    if (!meta) {
      throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
    }
    const resultMeta = meta.find(
      (m: { identifier: string; type: MerkleTreeType }) =>
        m.identifier === identifier && m.type === mtType
    );
    if (!resultMeta) {
      throw new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
    }

    const tree = new Merkletree(
      new IndexedDBStorage(str2Bytes(resultMeta.treeId)),
      true,
      this._mtDepth
    );

    await tree.add(hindex, hvalue);
  }

  /** binds merkle tree in the mongo db storage to the new identifiers */
  async bindMerkleTreeToNewIdentifier(oldIdentifier: string, newIdentifier: string): Promise<void> {
    const meta = await this._merkleTreeMetaStore.get(oldIdentifier);
    if (!meta || !meta?.length) {
      throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
    }

    const treesMeta = meta.map((m: { identifier: string; type: MerkleTreeType }) => ({
      ...m,
      identifier: newIdentifier
    }));

    await this._merkleTreeMetaStore.delete(oldIdentifier);
    await this._merkleTreeMetaStore.save(newIdentifier, treesMeta);
    await this._bindingStore.save(oldIdentifier, newIdentifier);
  }
}
