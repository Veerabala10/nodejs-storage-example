"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBPrivateKeyStoreFactory = void 0;
const key_store_1 = require("./key-store");
/**
 * Returns instance of MongoDBPrivateKeyStore
 */
const MongoDBPrivateKeyStoreFactory = async (db, collection) => {
    const collectionInstance = db.collection(collection ?? 'keystore');
    return new key_store_1.MongoDBPrivateKeyStore(collectionInstance);
};
exports.MongoDBPrivateKeyStoreFactory = MongoDBPrivateKeyStoreFactory;
//# sourceMappingURL=key-store-factory.js.map