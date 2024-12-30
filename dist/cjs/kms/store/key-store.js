"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBPrivateKeyStore = void 0;
/**
 * Allows storing keys in the Mongo DB storage
 * (NOT ENCRYPTED: DO NOT USE IN THE PRODUCTION)
 *
 * @public
 * @class MongoDBPrivateKeyStore
 * @implements implements AbstractPrivateKeyStore interface
 */
class MongoDBPrivateKeyStore {
    constructor(_collection) {
        this._collection = _collection;
    }
    /**
     * Gets key from the MongoDB storage
     *
     * @param {{ alias: string }} args
     * @returns hex string
     */
    async get(args) {
        const privateKeyObj = await this._collection.findOne({ alias: args.alias });
        if (!privateKeyObj) {
            throw new Error('no key under given alias');
        }
        return privateKeyObj.key;
    }
    /**
     * Import key to the MongoDB storage
     *
     * @param {{ alias: string; key: string }} args - alias and private key in the hex
     * @returns void
     */
    async importKey(args) {
        await this._collection.findOneAndDelete({ alias: args.alias });
        await this._collection.insertOne({ alias: args.alias, key: args.key });
    }
    /**
     * Retrieves a list of key aliases and their corresponding keys from the collection.
     *
     * @returns {Promise<{ alias: string; key: string }[]>} A promise that resolves to an array of objects,
     * each containing an alias and a key.
     */
    list() {
        return this._collection.find().toArray();
    }
}
exports.MongoDBPrivateKeyStore = MongoDBPrivateKeyStore;
//# sourceMappingURL=key-store.js.map