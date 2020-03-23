import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = new MongoMemoryServer({
  instance: {
    ip: '127.0.0.1',
    dbName: 'jest',
    port: 27018,
  },
  autoStart: false,
  debug: false,
});

module.exports = async () => {
  process.env.MONGO_URL = await mongod.getConnectionString();
  global.__MONGOD__ = mongod;
};
