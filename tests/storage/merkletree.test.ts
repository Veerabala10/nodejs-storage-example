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

describe('Test MerkleTreeMongodDBStorage', () => {
  const RPC_URL = 'https://rpc-mumbai.maticvigil.com';
  const CONTRACT_ADDRESS = '';

  let dataStorage: IDataStorage;
  beforeEach(async () => {
    const mongod = await MongoMemoryServer.create();
    const url = mongod.getUri();
    const dbName = 'mongodb-sdk-example';

    const ethConfig: EthConnectionConfig = defaultEthConnectionConfig;
    ethConfig.contractAddress = CONTRACT_ADDRESS;
    ethConfig.url = RPC_URL;

    dataStorage = {
      credential: new CredentialStorage(
        await MongoDataSourceFactory<W3CCredential>(url, dbName, 'credentials')
      ),
      identity: new IdentityStorage(
        await MongoDataSourceFactory<Identity>(url, dbName, 'identity'),
        await MongoDataSourceFactory<Profile>(url, dbName, 'profile')
      ),
      mt: await MerkleTreeMongodDBStorage.setup(url, dbName, 40),
      states: new EthStateStorage(ethConfig)
    };
  });

  it('Test DataStorage initialized', async () => {
    expect(dataStorage).not.be.null;
  });
});
