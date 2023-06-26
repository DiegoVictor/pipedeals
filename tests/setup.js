import { MongoMemoryServer } from 'mongodb-memory-server';

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();

  process.env.MONGO_URL = mongod.getUri();
  global.__MONGOD__ = mongod;
};
