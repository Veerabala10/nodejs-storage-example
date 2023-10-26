"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBTreeStorageFactory = exports.MongoDataSourceFactory = void 0;
const data_source_1 = require("./data-source");
const tree_storage_1 = require("./tree-storage");
/**
 * Returns instance of Mongo Data Source
 */
const MongoDataSourceFactory = async (db, collection) => {
    const collectionInstance = db.collection(collection);
    return new data_source_1.MongoDataSource(collectionInstance);
};
exports.MongoDataSourceFactory = MongoDataSourceFactory;
/**
 * Returns instance of MongoDBTreeStorage
 */
const MongoDBTreeStorageFactory = async (db, prefix, collection) => {
    const collectionInstance = db.collection(collection ?? 'merkle-tree');
    return tree_storage_1.MongoDBTreeStorage.setup(prefix, collectionInstance);
};
exports.MongoDBTreeStorageFactory = MongoDBTreeStorageFactory;
//# sourceMappingURL=data-source-factory.js.map