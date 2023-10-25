import { Bytes } from '@iden3/js-merkletree';
import { MongoClient, Document } from 'mongodb';
import { MongoDataSource } from './data-source';
import { MongoDBStorage } from './tree-storage';

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

/**
 * Returns instance of MongoDBStorage
 */
export const MongoDBStorageFactory = async (
  prefix: Bytes,
  url: string,
  dbName?: string,
  collection?: string
) => {
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName ?? 'merkle-tree');
  const collectionInstance = db.collection<any>(collection ?? 'merkle-tree');
  return MongoDBStorage.setup(prefix, collectionInstance);
};
