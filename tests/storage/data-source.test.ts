import { Identity, Profile } from '@0xpolygonid/js-sdk';
import { expect } from 'chai';
import { MongoDataSource } from '../../src/storage/data-source';
import { MongoDataSourceFactory } from '../../src/storage/data-source-factory';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Hash, HASH_BYTES_LENGTH } from '@iden3/js-merkletree';

describe('Test MongoDB Data Source', () => {
  let dbSource: MongoDataSource<Profile>;
  let dbSourceIdentity: MongoDataSource<Identity>;
  beforeEach(async () => {
    const mongodb = await MongoMemoryServer.create();
    dbSource = await MongoDataSourceFactory(
      mongodb.getUri(),
      'mongodb-sdk-example',
      'test-collection-profile'
    );

    dbSourceIdentity = await MongoDataSourceFactory(
      mongodb.getUri(),
      'mongodb-sdk-example',
      'test-collection-identity'
    );
  });

  it('Test all operations', async () => {
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


    const bytes = new Uint8Array(HASH_BYTES_LENGTH);
    bytes[0] = 12;
    bytes[1] = 11;
    bytes[10] = 10;
    bytes[31] = 22;
    const v = new Hash(bytes);

    const identity: Identity = {
      did: '',
      state: v
    };

    await dbSourceIdentity.save('1', identity);
    const identityFromDb = await dbSourceIdentity.get('1');
    const hashFromRow = new Hash(Object.values(identityFromDb!.state!.bytes) as unknown as Uint8Array);
    expect(v.bigInt()).to.be.equal(hashFromRow.bigInt());

    // profileFind = await dbSource.get('testverifier', 'verifier');
    // expect(profileFind?.nonce).to.be.equal(223);
    // await dbSource.delete('testverifier', 'verifier');
    // profiles = await dbSource.load();
    // expect(profiles.length).length.to.be.equal(0);
    // profileFind = await dbSource.get(keyVal);
    // expect(profileFind).to.be.undefined;
  });
});
