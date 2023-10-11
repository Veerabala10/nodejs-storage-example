"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBStorageFactory = exports.MongoDataSourceFactory = void 0;
const mongodb_1 = require("mongodb");
const data_source_1 = require("./data-source");
const tree_storage_1 = require("./tree-storage");
/**
 * Returns instance of Mongo Data Source
 */
const MongoDataSourceFactory = async (url, dbName, collection) => {
    const client = new mongodb_1.MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionInstance = db.collection(collection);
    return new data_source_1.MongoDataSource(collectionInstance);
};
exports.MongoDataSourceFactory = MongoDataSourceFactory;
/**
 * Returns instance of MongoDBStorage
 */
const MongoDBStorageFactory = async (prefix, url, dbName, collection) => {
    const client = new mongodb_1.MongoClient(url);
    await client.connect();
    const db = client.db(dbName ?? 'merkle-tree');
    const collectionInstance = db.collection(collection ?? 'merkle-tree');
    return new tree_storage_1.MongoDBStorage(prefix, collectionInstance);
};
exports.MongoDBStorageFactory = MongoDBStorageFactory;
//# sourceMappingURL=data-source-factory.js.map