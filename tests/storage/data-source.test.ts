import { Profile } from '@0xpolygonid/js-sdk';
import { expect } from 'chai';
import { MongoDataSource } from '../../src/storage/data-source';
import { MongoDataSourceFactory } from '../../src/storage/data-source-factory';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Test MongoDB Data Source', () => {
  let dbSource: MongoDataSource<Profile>;
  beforeEach(async () => {
    const mongodb = await MongoMemoryServer.create();
    dbSource = await MongoDataSourceFactory(
      mongodb.getUri(),
      'mongodb-sdk-example',
      'test-collection'
    );
  });

  it.only('Test all operations', async () => {
    const keyVal = '12111';
    let profiles = await dbSource.load();
    expect((await profiles).length).to.be.equal(0);

    const profile1: Profile = {
      id: '123',
      nonce: 223,
      genesisIdentifier: 'testidentifier',
      verifier: 'testverifier'
    };
    await dbSource.save(keyVal, profile1);

    profiles = await dbSource.load();

    expect(profiles.length).to.be.equal(1);
    expect(profiles[0].id).to.be.equal('123');

    let profileFind = await dbSource.get(keyVal);
    expect(profileFind?.id).to.be.equal('123');

    // profileFind = await dbSource.get('testverifier', 'verifier');
    // expect(profileFind?.nonce).to.be.equal(223);
    // await dbSource.delete('testverifier', 'verifier');
    // profiles = await dbSource.load();
    // expect(profiles.length).length.to.be.equal(0);
    // profileFind = await dbSource.get(keyVal);
    // expect(profileFind).to.be.undefined;
  });
});
