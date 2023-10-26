import {
  CredentialStorage,
  defaultEthConnectionConfig,
  EthConnectionConfig,
  EthStateStorage,
  IDataStorage,
  Identity,
  IdentityStorage,
  Profile,
  W3CCredential
} from '@0xpolygonid/js-sdk';
import { MerkleTreeMongodDBStorage } from '../../src/storage/merkletree';
import { MongoDataSourceFactory } from '../../src/storage/data-source-factory';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import { MongoClient } from 'mongodb';

describe('Test MerkleTreeMongodDBStorage', () => {
  const RPC_URL = 'https://rpc-mumbai.maticvigil.com';
  const CONTRACT_ADDRESS = '';

  let dataStorage: IDataStorage;
  beforeEach(async () => {
    const mongodb = await MongoMemoryServer.create();

    const ethConfig: EthConnectionConfig = defaultEthConnectionConfig;
    ethConfig.contractAddress = CONTRACT_ADDRESS;
    ethConfig.url = RPC_URL;

    const client = new MongoClient(mongodb.getUri());
    await client.connect();
    const db = client.db('mongodb-sdk-example');

    dataStorage = {
      credential: new CredentialStorage(
        await MongoDataSourceFactory<W3CCredential>(db, 'credentials')
      ),
      identity: new IdentityStorage(
        await MongoDataSourceFactory<Identity>(db, 'identity'),
        await MongoDataSourceFactory<Profile>(db, 'profile')
      ),
      mt: await MerkleTreeMongodDBStorage.setup(db, 40),
      states: new EthStateStorage(ethConfig)
    };
  });

  it('Test DataStorage initialized', async () => {
    expect(dataStorage).not.be.null;
  });
});
