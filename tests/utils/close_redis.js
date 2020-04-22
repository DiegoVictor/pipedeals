export default async redis => {
  await new Promise(resolve => {
    redis.quit(() => {
      resolve();
    });
  });
  await new Promise(resolve => setImmediate(resolve));
};
