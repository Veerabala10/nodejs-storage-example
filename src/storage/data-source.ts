import { IDataSource } from '@0xpolygonid/js-sdk';
import { Collection, Document, Filter } from 'mongodb';

/**
 * Mongo DB data source
 */
export class MongoDataSource<Type extends Document> implements IDataSource<Type> {
  public constructor(private readonly _collection: Collection<Type>) {}

  /**
   * load all object with Type from data source
   *
   * @returns `{Type[]}`
   */
  public load(): Promise<Type[]> {
    return this._collection
      .find({})
      .map((i) => { return {_id: i._id, ...JSON.parse(i.value) } })
      .toArray();
  }

  /**
   * Save value under the key with optional key name
   *
   * @param {string} key - key value
   * @param {Type} value - value to store
   * @param {string} [keyName] - key name
   */
  public async save(key: string, value: Type, keyName = '_id'): Promise<void> {
    await this.delete(key, keyName);
    const document = {
      [keyName]: key,
      value: JSON.stringify(value)
    };
    await this._collection.insertOne(document as any);
  }

  /**
   * returns data value for key value and optional key name
   *
   * @param {string} key - key value
   * @param {string} [keyName] -  key name
   * @returns ` {(Type | undefined)}`
   */
  public async get(key: string, keyName = '_id'): Promise<Type | undefined> {
    let rows = await this.load();
    return rows.find(i => i[keyName] === key);
  }

  /**
   * deletes data value for given key with an optional key name
   *
   * @param {string} key - key value
   * @param {string} [keyName] -  key name
   */
  public async delete(key: string, keyName = '_id'): Promise<void> {
    let row = await this.get(key, keyName);
    if (!row) {
      return;
    }
    const filter = {
      '_id': row._id
    } as Filter<Type>;
    await this._collection.deleteOne(filter);
  }
}
