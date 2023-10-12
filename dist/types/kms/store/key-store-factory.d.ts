import { Document } from 'mongodb';
import { MongoDBPrivateKeyStore } from './key-store';
/**
 * Returns instance of MongoDBPrivateKeyStore
 */
export declare const MongoDBPrivateKeyStoreFactory: <Type extends Document>(url: string, dbName: string, collection?: string) => Promise<MongoDBPrivateKeyStore>;
