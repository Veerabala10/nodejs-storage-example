import { Bytes } from '@iden3/js-merkletree';
import { MongoClient, Document } from 'mongodb';
import { MongoDBPrivateKeyStore } from './key-store';

/**
 * Returns instance of MongoDBPrivateKeyStore
 */
export const MongoDBPrivateKeyStoreFactory = async <Type extends Document>(
  url: string,
  dbName: string,
  collection?: string
) => {
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);
  const collectionInstance = db.collection<Type>(collection ?? 'keystore');
  return new MongoDBPrivateKeyStore(collectionInstance);
};
