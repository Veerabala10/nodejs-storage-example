import { IDataSource } from '@0xpolygonid/js-sdk';
import { Collection, Document } from 'mongodb';
/**
 * Mongo DB data source
 */
export declare class MongoDataSource<Type extends Document> implements IDataSource<Type> {
    private readonly _collection;
    constructor(_collection: Collection<Type>);
    /**
     * load all object with Type from data source
     *
     * @returns `{Type[]}`
     */
    load(): Promise<Type[]>;
    /**
     * Save value under the key with optional key name
     *
     * @param {string} key - key value
     * @param {Type} value - value to store
     * @param {string} [keyName] - key name
     */
    save(key: string, value: Type): Promise<void>;
    /**
     * returns data value for key value and optional key name
     *
     * @param {string} key - key value
     * @param {string} [keyName] -  key name
     * @returns ` {(Type | undefined)}`
     */
    get(key: string): Promise<Type | undefined>;
    /**
     * deletes data value for given key with an optional key name
     *
     * @param {string} key - key value
     * @param {string} [keyName] -  key name
     */
    delete(key: string): Promise<void>;
}
