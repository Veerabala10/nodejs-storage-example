import { Merkletree } from '@iden3/js-merkletree';
import { IdentityMerkleTreeMetaInformation, IMerkleTreeStorage, MerkleTreeType } from '@0xpolygonid/js-sdk';
import { MongoDataSource } from './data-source';
export declare const MERKLE_TREE_TYPES: MerkleTreeType[];
/**
 * Merkle tree storage that uses mongo db storage
 *
 * @public
 * @class MerkleTreeMongodDBStorage
 * @implements implements IMerkleTreeStorage interface
 */
export declare class MerkleTreeMongodDBStorage implements IMerkleTreeStorage {
    private readonly _mtDepth;
    private readonly _merkleTreeMetaStore;
    private readonly _bindingStore;
    private readonly _treeStorageMongoConnectionURL;
    /**
     * Creates an instance of MerkleTreeIndexedDBStorage.
     * @param {number} _mtDepth
     * @param {MongoDataSource<any>} _merkleTreeMetaStore
     * @param {MongoDataSource<any>} _bindingStore
     */
    constructor(_mtDepth: number, _merkleTreeMetaStore: MongoDataSource<any>, _bindingStore: MongoDataSource<any>, _treeStorageMongoConnectionURL: string);
    /** creates a tree in the indexed db storage */
    createIdentityMerkleTrees(identifier: string): Promise<IdentityMerkleTreeMetaInformation[]>;
    /**
     *
     * getIdentityMerkleTreesInfo from the mongo db storage
     * @param {string} identifier
     * @returns `{Promise<IdentityMerkleTreeMetaInformation[]>}`
     */
    getIdentityMerkleTreesInfo(identifier: string): Promise<IdentityMerkleTreeMetaInformation[]>;
    /** get merkle tree from the mongo db storage */
    getMerkleTreeByIdentifierAndType(identifier: string, mtType: MerkleTreeType): Promise<Merkletree>;
    /** adds to merkle tree in the mongo db storage */
    addToMerkleTree(identifier: string, mtType: MerkleTreeType, hindex: bigint, hvalue: bigint): Promise<void>;
    /** binds merkle tree in the mongo db storage to the new identifiers */
    bindMerkleTreeToNewIdentifier(oldIdentifier: string, newIdentifier: string): Promise<void>;
}
