import { MongoClient, Document } from 'mongodb';
import { MongoDataSource } from './data-source';

/**
 * Returns instance of Mongo Data Source
 */
export const MongoDataSourceFactory = async <Type extends Document>(
  url: string,
  dbName: string,
  collection: string
) => {
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);
  const collectionInstance = db.collection<Type>(collection);
  return new MongoDataSource<Type>(collectionInstance);
};
