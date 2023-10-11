"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MongoDBStorage_currentRoot;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBStorage = void 0;
const js_merkletree_1 = require("@iden3/js-merkletree");
class MongoDBStorage {
    constructor(_collection, _prefix, _prefixHash, currentRoot) {
        this._collection = _collection;
        this._prefix = _prefix;
        this._prefixHash = _prefixHash;
        _MongoDBStorage_currentRoot.set(this, void 0);
        __classPrivateFieldSet(this, _MongoDBStorage_currentRoot, currentRoot, "f");
    }
    static async setup(prefix, _collection) {
        const prefixHash = (0, js_merkletree_1.bytes2Hex)(prefix);
        const rootStr = await _collection.findOne({ key: prefixHash });
        let currentRoot;
        if (rootStr) {
            console.log('setup:::::::::' + rootStr);
            const bytes = JSON.parse(rootStr.value);
            console.log('setup::::::::: ss' + JSON.stringify(bytes));
            currentRoot = new js_merkletree_1.Hash(Uint8Array.from(bytes));
            console.log('setup current root ********* ' + JSON.stringify(currentRoot));
        }
        else {
            currentRoot = js_merkletree_1.ZERO_HASH;
        }
        return new MongoDBStorage(_collection, prefix, prefixHash, currentRoot);
    }
    async get(k) {
        const kBytes = new Uint8Array([...this._prefix, ...k]);
        const key = (0, js_merkletree_1.bytes2Hex)(kBytes);
        let obj = (await this._collection.findOne({ key: key })).value;
        if (obj === null || obj === undefined) {
            return undefined;
        }
        obj = JSON.parse(obj);
        if (obj.type === js_merkletree_1.NODE_TYPE_EMPTY) {
            return new js_merkletree_1.NodeEmpty();
        }
        if (obj.type === js_merkletree_1.NODE_TYPE_MIDDLE) {
            const cL = new js_merkletree_1.Hash(Uint8Array.from(Object.values(obj.childL.bytes)));
            const cR = new js_merkletree_1.Hash(Uint8Array.from(Object.values(obj.childR.bytes)));
            return new js_merkletree_1.NodeMiddle(cL, cR);
        }
        if (obj.type === js_merkletree_1.NODE_TYPE_LEAF) {
            const k = new js_merkletree_1.Hash(Uint8Array.from(Object.values(obj.entry[0].bytes)));
            const v = new js_merkletree_1.Hash(Uint8Array.from(Object.values(obj.entry[1].bytes)));
            return new js_merkletree_1.NodeLeaf(k, v);
        }
        throw new Error(`error: value found for key ${key} is not of type Node`);
    }
    async put(k, n) {
        const kBytes = new Uint8Array([...this._prefix, ...k]);
        const key = (0, js_merkletree_1.bytes2Hex)(kBytes);
        await this._collection.findOneAndDelete({ key: key });
        await this._collection.insertOne({ key: key, value: JSON.stringify(n) });
    }
    async getRoot() {
        if (!__classPrivateFieldGet(this, _MongoDBStorage_currentRoot, "f").equals(js_merkletree_1.ZERO_HASH)) {
            return __classPrivateFieldGet(this, _MongoDBStorage_currentRoot, "f");
        }
        let root = (await this._collection.findOne({ key: this._prefixHash }))?.value;
        if (!root) {
            __classPrivateFieldSet(this, _MongoDBStorage_currentRoot, js_merkletree_1.ZERO_HASH, "f");
        }
        else {
            root = JSON.parse(root);
            let bytes = root.bytes ? Object.values(root.bytes) : root.bytes;
            __classPrivateFieldSet(this, _MongoDBStorage_currentRoot, new js_merkletree_1.Hash(bytes), "f");
        }
        return __classPrivateFieldGet(this, _MongoDBStorage_currentRoot, "f");
    }
    async setRoot(r) {
        await this._collection.findOneAndDelete({ key: this._prefixHash });
        await this._collection.insertOne({ key: this._prefixHash, value: JSON.stringify(r) });
        __classPrivateFieldSet(this, _MongoDBStorage_currentRoot, r, "f");
    }
}
exports.MongoDBStorage = MongoDBStorage;
_MongoDBStorage_currentRoot = new WeakMap();
//# sourceMappingURL=tree-storage.js.map