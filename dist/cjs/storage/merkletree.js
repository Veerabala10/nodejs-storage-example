"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerkleTreeMongodDBStorage = exports.MERKLE_TREE_TYPES = void 0;
const js_merkletree_1 = require("@iden3/js-merkletree");
const uuid = __importStar(require("uuid"));
const js_sdk_1 = require("@0xpolygonid/js-sdk");
const data_source_factory_1 = require("./data-source-factory");
exports.MERKLE_TREE_TYPES = [
    js_sdk_1.MerkleTreeType.Claims,
    js_sdk_1.MerkleTreeType.Revocations,
    js_sdk_1.MerkleTreeType.Roots
];
/**
 * Merkle tree storage that uses mongo db storage
 *
 * @public
 * @class MerkleTreeMongodDBStorage
 * @implements implements IMerkleTreeStorage interface
 */
class MerkleTreeMongodDBStorage {
    /**
     * Creates an instance of MerkleTreeIndexedDBStorage.
     * @param {number} _mtDepth
     * @param {MongoDataSource<any>} _merkleTreeMetaStore
     * @param {MongoDataSource<any>} _bindingStore
     */
    constructor(_mtDepth, _merkleTreeMetaStore, _bindingStore, _treeStorageMongoConnectionURL) {
        this._mtDepth = _mtDepth;
        this._merkleTreeMetaStore = _merkleTreeMetaStore;
        this._bindingStore = _bindingStore;
        this._treeStorageMongoConnectionURL = _treeStorageMongoConnectionURL;
    }
    /** creates a tree in the indexed db storage */
    async createIdentityMerkleTrees(identifier) {
        if (!identifier) {
            identifier = `${uuid.v4()}`;
        }
        const existingBinging = await this._bindingStore.get(identifier);
        if (existingBinging) {
            throw new Error(`Present merkle tree meta information in the store for current identifier ${identifier}`);
        }
        const createMerkleTreeMetaInfo = (identifier) => {
            const treesMeta = [];
            for (let index = 0; index < exports.MERKLE_TREE_TYPES.length; index++) {
                const mType = exports.MERKLE_TREE_TYPES[index];
                const treeId = `${identifier}+${mType}`;
                treesMeta.push({ treeId, identifier, type: mType });
            }
            return treesMeta;
        };
        const treesMeta = createMerkleTreeMetaInfo(identifier);
        console.log('treesMeta: ' + JSON.stringify(treesMeta));
        await this._merkleTreeMetaStore.save(identifier, { meta: JSON.stringify(treesMeta) });
        return treesMeta;
    }
    /**
     *
     * getIdentityMerkleTreesInfo from the mongo db storage
     * @param {string} identifier
     * @returns `{Promise<IdentityMerkleTreeMetaInformation[]>}`
     */
    async getIdentityMerkleTreesInfo(identifier) {
        const meta = await this._merkleTreeMetaStore.get(identifier);
        if (meta && meta.meta) {
            return JSON.parse(meta.meta);
        }
        throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
    }
    /** get merkle tree from the mongo db storage */
    async getMerkleTreeByIdentifierAndType(identifier, mtType) {
        let meta = await this._merkleTreeMetaStore.get(identifier);
        const err = new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
        if (!meta) {
            throw err;
        }
        meta = JSON.parse(meta.meta);
        const resultMeta = meta.find((m) => m.identifier === identifier && m.type === mtType);
        if (!resultMeta) {
            throw err;
        }
        const mongoDBTreeStorage = await (0, data_source_factory_1.MongoDBStorageFactory)((0, js_merkletree_1.str2Bytes)(resultMeta.treeId), this._treeStorageMongoConnectionURL);
        return new js_merkletree_1.Merkletree(mongoDBTreeStorage, true, this._mtDepth);
    }
    /** adds to merkle tree in the mongo db storage */
    async addToMerkleTree(identifier, mtType, hindex, hvalue) {
        let meta = await this._merkleTreeMetaStore.get(identifier);
        if (!meta || !meta.meta) {
            throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
        }
        console.log('addToMerkleTree:' + meta.meta);
        meta = JSON.parse(meta.meta);
        const resultMeta = meta.find((m) => m.identifier === identifier && m.type === mtType);
        if (!resultMeta) {
            throw new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
        }
        const mongoDBTreeStorage = await (0, data_source_factory_1.MongoDBStorageFactory)((0, js_merkletree_1.str2Bytes)(resultMeta.treeId), this._treeStorageMongoConnectionURL);
        const tree = new js_merkletree_1.Merkletree(mongoDBTreeStorage, true, this._mtDepth);
        await tree.add(hindex, hvalue);
    }
    /** binds merkle tree in the mongo db storage to the new identifiers */
    async bindMerkleTreeToNewIdentifier(oldIdentifier, newIdentifier) {
        let meta = await this._merkleTreeMetaStore.get(oldIdentifier);
        if (!meta || !meta?.length) {
            throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
        }
        meta = JSON.parse(meta.meta);
        const treesMeta = meta.map((m) => ({
            ...m,
            identifier: newIdentifier
        }));
        await this._merkleTreeMetaStore.delete(oldIdentifier);
        console.log('bindMerkleTreeToNewIdentifier: ' + JSON.stringify(treesMeta));
        await this._merkleTreeMetaStore.save(newIdentifier, { meta: JSON.stringify(treesMeta) });
        await this._bindingStore.save(oldIdentifier, newIdentifier);
    }
}
exports.MerkleTreeMongodDBStorage = MerkleTreeMongodDBStorage;
//# sourceMappingURL=merkletree.js.map