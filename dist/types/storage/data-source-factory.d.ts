import { Bytes } from '@iden3/js-merkletree';
import { Document, Db } from 'mongodb';
import { MongoDataSource } from './data-source';
import { MongoDBTreeStorage } from './tree-storage';
/**
 * Returns instance of Mongo Data Source
 */
export declare const MongoDataSourceFactory: <Type extends Document>(db: Db, collection: string) => Promise<MongoDataSource<Type>>;
/**
 * Returns instance of MongoDBTreeStorage
 */
export declare const MongoDBTreeStorageFactory: (db: Db, prefix: Bytes, collection?: string) => Promise<MongoDBTreeStorage>;
