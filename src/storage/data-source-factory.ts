import { Bytes } from '@iden3/js-merkletree';
import { Document, Db } from 'mongodb';
import { MongoDataSource } from './data-source';
import { MongoDBTreeStorage } from './tree-storage';

/**
 * Returns instance of Mongo Data Source
 */
export const MongoDataSourceFactory = async <Type extends Document>(db: Db, collection: string) => {
  const collectionInstance = db.collection<Type>(collection);
  return new MongoDataSource<Type>(collectionInstance);
};

/**
 * Returns instance of MongoDBTreeStorage
 */
export const MongoDBTreeStorageFactory = async (db: Db, prefix: Bytes, collection?: string) => {
  const collectionInstance = db.collection<any>(collection ?? 'merkle-tree');
  return MongoDBTreeStorage.setup(prefix, collectionInstance);
};
