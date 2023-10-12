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
    async load() {
        return this._collection
            .find({})
            .map((i) => { return { _id: i._id, ...JSON.parse(i.value) }; })
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
        let rows = await this.load();
        return rows.find(i => i[keyName] === key);
    }
    /**
     * deletes data value for given key with an optional key name
     *
     * @param {string} key - key value
     * @param {string} [keyName] -  key name
     */
    async delete(key, keyName = '_id') {
        let row = await this.get(key, keyName);
        if (!row) {
            return;
        }
        const filter = {
            '_id': row._id
        };
        await this._collection.deleteOne(filter);
    }
}
exports.MongoDataSource = MongoDataSource;
//# sourceMappingURL=data-source.js.map