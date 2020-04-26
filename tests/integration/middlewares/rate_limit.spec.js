import ratelimit from '../../../src/config/ratelimit';
import RateLimit from '../../../src/app/middlewares/RateLimit';

describe('RateLimit middleware', () => {
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(),
  };
  const next = jest.fn();

  it('should be able to consume the api', async () => {
    await RateLimit({}, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should not be able to consume after many requests', () => {
    const requests = [];
    let i = 0;
    while (i < ratelimit.points) {
      requests.push(RateLimit({}, res, next));
      i += 1;
    }

    Promise.all(requests).catch(err => {
      expect({ ...err }).toStrictEqual({
        data: { code: 449 },
        isBoom: true,
        isServer: false,
        output: {
          statusCode: 429,
          payload: {
            statusCode: 429,
            error: 'Too Many Requests',
            message: 'Too Many Requests',
          },
          headers: {},
        },
      });
    });
  });
});
