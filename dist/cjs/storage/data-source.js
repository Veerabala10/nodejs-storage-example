"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDataSource = void 0;
/**
 * Mongo DB data source
 */
class MongoDataSource {
    constructor(_collection) {
        this._collection = _collection;
    }
    /**
     * load all object with Type from data source
     *
     * @returns `{Type[]}`
     */
    load() {
        return this._collection
            .find({})
            .map((i) => JSON.parse(i.value))
            .toArray();
    }
    /**
     * Save value under the key with optional key name
     *
     * @param {string} key - key value
     * @param {Type} value - value to store
     * @param {string} [keyName] - key name
     */
    async save(key, value, keyName = '_id') {
        await this.delete(key, keyName);
        const document = {
            [keyName]: key,
            value: JSON.stringify(value)
        };
        await this._collection.insertOne(document);
    }
    /**
     * returns data value for key value and optional key name
     *
     * @param {string} key - key value
     * @param {string} [keyName] -  key name
     * @returns ` {(Type | undefined)}`
     */
    async get(key, keyName = '_id') {
        const filter = {
            [keyName]: key
        };
        const row = await this._collection.findOne(filter);
        if (!row) {
            return undefined;
        }
        return JSON.parse(row.value);
    }
    /**
     * deletes data value for given key with an optional key name
     *
     * @param {string} key - key value
     * @param {string} [keyName] -  key name
     */
    async delete(key, keyName = '_id') {
        const filter = {
            [keyName]: key
        };
        await this._collection.deleteOne(filter);
    }
}
exports.MongoDataSource = MongoDataSource;
//# sourceMappingURL=data-source.js.map