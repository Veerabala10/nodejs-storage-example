import { Bytes } from '@iden3/js-merkletree';
import { Document } from 'mongodb';
import { MongoDataSource } from './data-source';
import { MongoDBStorage } from './tree-storage';
/**
 * Returns instance of Mongo Data Source
 */
export declare const MongoDataSourceFactory: <Type extends Document>(url: string, dbName: string, collection: string) => Promise<MongoDataSource<Type>>;
/**
 * Returns instance of MongoDBStorage
 */
export declare const MongoDBStorageFactory: (prefix: Bytes, url: string, dbName?: string, collection?: string) => Promise<MongoDBStorage>;
