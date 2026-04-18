import {objectPromiseAll} from '../src/utils/PromiseResolver';

describe('objectPromiseAll', () => {
  test('resolves keyed promises without losing property names', async () => {
    const result = await objectPromiseAll({
      count: Promise.resolve(2),
      label: Promise.resolve('kitn'),
      enabled: Promise.resolve(true),
    });

    expect(result).toEqual({
      count: 2,
      label: 'kitn',
      enabled: true,
    });
  });
});
