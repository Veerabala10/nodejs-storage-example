import { MongoClient, Document } from 'mongodb';
import { MongoDataSource } from './data-source';

/**
 * Mongo DB connection options
 */
export class DbConnectionOptions {
  url!: string;
  dbName!: string;
  collection!: string;
}

/**
 * Returns instance of Mongo Data Source
 */
export const MongoDataSourceFactory = async <Type extends Document>(
  connection: DbConnectionOptions
) => {
  const client = new MongoClient(connection.url);
  await client.connect();
  const db = client.db(connection.dbName);
  const collection = db.collection<Type>(connection.collection);
  return new MongoDataSource<Type>(collection);
};
