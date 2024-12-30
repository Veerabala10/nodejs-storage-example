import { Document, Db } from 'mongodb';
import { MongoDBPrivateKeyStore } from './key-store';
/**
 * Returns instance of MongoDBPrivateKeyStore
 */
export declare const MongoDBPrivateKeyStoreFactory: <Type extends Document>(db: Db, collection?: string) => Promise<MongoDBPrivateKeyStore>;
