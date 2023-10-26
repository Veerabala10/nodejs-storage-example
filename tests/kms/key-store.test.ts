import { expect } from 'chai';
import { MongoDBPrivateKeyStore } from '../../src/kms/store/key-store';
import { MongoDBPrivateKeyStoreFactory } from '../../src/kms/store/key-store-factory';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

describe('Test MongoDB Data Source', () => {
  let keyStore: MongoDBPrivateKeyStore;
  beforeEach(async () => {
    const mongodb = await MongoMemoryServer.create();
    const client = new MongoClient(mongodb.getUri());
    await client.connect();
    const db = client.db('mongodb-sdk-example');

    keyStore = await MongoDBPrivateKeyStoreFactory(db, 'mongodb-key-store-example');
  });

  it('Test all operations', async () => {
    try {
      await keyStore.get({ alias: 'key1' });
      throw new Error('was not supposed to succeed');
    } catch (e: any) {
      expect(e.message).to.equal(`no key under given alias`);
    }
    const key = 'fnsdf12312313';
    await keyStore.importKey({ alias: 'key1', key });
    const ketFromStore = await keyStore.get({ alias: 'key1' });
    expect(key).to.be.equal(ketFromStore);
  });
});
