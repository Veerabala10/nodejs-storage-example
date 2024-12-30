import { AbstractPrivateKeyStore, KmsKeyId } from '@0xpolygonid/js-sdk';
import { Collection } from 'mongodb';

/**
 * Allows storing keys in the Mongo DB storage
 * (NOT ENCRYPTED: DO NOT USE IN THE PRODUCTION)
 *
 * @public
 * @class MongoDBPrivateKeyStore
 * @implements implements AbstractPrivateKeyStore interface
 */
export class MongoDBPrivateKeyStore implements AbstractPrivateKeyStore {
  constructor(private readonly _collection: Collection<any>) {}

  /**
   * Gets key from the MongoDB storage
   *
   * @param {{ alias: string }} args
   * @returns hex string
   */
  async get(args: { alias: string }): Promise<string> {
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
  async importKey(args: { alias: string; key: string }): Promise<void> {
    await this._collection.findOneAndDelete({ alias: args.alias });
    await this._collection.insertOne({ alias: args.alias, key: args.key });
  }

  /**
   * Retrieves a list of key aliases and their corresponding keys from the collection.
   *
   * @returns {Promise<{ alias: string; key: string }[]>} A promise that resolves to an array of objects,
   * each containing an alias and a key.
   */
  list(): Promise<{ alias: string; key: string }[]> {
    return this._collection.find().toArray();
  }
}
