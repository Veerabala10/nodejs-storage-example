"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBPrivateKeyStoreFactory = void 0;
const mongodb_1 = require("mongodb");
const key_store_1 = require("./key-store");
/**
 * Returns instance of MongoDBPrivateKeyStore
 */
const MongoDBPrivateKeyStoreFactory = async (url, dbName, collection) => {
    const client = new mongodb_1.MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionInstance = db.collection(collection ?? 'keystore');
    return new key_store_1.MongoDBPrivateKeyStore(collectionInstance);
};
exports.MongoDBPrivateKeyStoreFactory = MongoDBPrivateKeyStoreFactory;
//# sourceMappingURL=key-store-factory.js.map