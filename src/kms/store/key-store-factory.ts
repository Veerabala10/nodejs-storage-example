import { Document, Db } from 'mongodb';
import { MongoDBPrivateKeyStore } from './key-store';

/**
 * Returns instance of MongoDBPrivateKeyStore
 */
export const MongoDBPrivateKeyStoreFactory = async <Type extends Document>(
  db: Db,
  collection?: string
) => {
  const collectionInstance = db.collection<Type>(collection ?? 'keystore');
  return new MongoDBPrivateKeyStore(collectionInstance);
};
