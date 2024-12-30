import { AbstractPrivateKeyStore } from '@0xpolygonid/js-sdk';
import { Collection } from 'mongodb';
/**
 * Allows storing keys in the Mongo DB storage
 * (NOT ENCRYPTED: DO NOT USE IN THE PRODUCTION)
 *
 * @public
 * @class MongoDBPrivateKeyStore
 * @implements implements AbstractPrivateKeyStore interface
 */
export declare class MongoDBPrivateKeyStore implements AbstractPrivateKeyStore {
    private readonly _collection;
    constructor(_collection: Collection<any>);
    /**
     * Gets key from the MongoDB storage
     *
     * @param {{ alias: string }} args
     * @returns hex string
     */
    get(args: {
        alias: string;
    }): Promise<string>;
    /**
     * Import key to the MongoDB storage
     *
     * @param {{ alias: string; key: string }} args - alias and private key in the hex
     * @returns void
     */
    importKey(args: {
        alias: string;
        key: string;
    }): Promise<void>;
    /**
     * Retrieves a list of key aliases and their corresponding keys from the collection.
     *
     * @returns {Promise<{ alias: string; key: string }[]>} A promise that resolves to an array of objects,
     * each containing an alias and a key.
     */
    list(): Promise<{
        alias: string;
        key: string;
    }[]>;
}
