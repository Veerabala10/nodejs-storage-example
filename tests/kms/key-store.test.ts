import { expect } from 'chai';
import { MongoDBPrivateKeyStore } from '../../src/kms/store/key-store';
import { MongoDBPrivateKeyStoreFactory } from '../../src/kms/store/key-store-factory';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Test MongoDB Data Source', () => {
  let keyStore: MongoDBPrivateKeyStore;
  beforeEach(async () => {
    const mongodb = await MongoMemoryServer.create();
    keyStore = await MongoDBPrivateKeyStoreFactory(mongodb.getUri(), 'mongodb-key-store-example');
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
