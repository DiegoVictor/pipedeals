import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = new MongoMemoryServer();

module.exports = async () => {
  await mongod.start();

  process.env.MONGO_URL = mongod.getUri();
  global.__MONGOD__ = mongod;
};
