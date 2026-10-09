jest.mock('../src/services/API/APIManager', () => ({
  readReportEmailStatus: jest.fn(),
}));
import {createReportEmailStatusReader} from '../src/services/ReportEmailStatusService';

const flush = async () => {
  for (let i = 0; i < 6; i += 1) {
    await Promise.resolve();
  }
};

test('bounds concurrent owner-only reads and skips unfocused queued cards', async () => {
  const completions = [];
  const fetchStatus = jest.fn(
    (owner, seq) =>
      new Promise(resolve =>
        completions.push(() => resolve({seq, status: 'sent'})),
      ),
  );
  const read = createReportEmailStatusReader(fetchStatus, 2);
  let focused = true;
  const first = read('owner', 1);
  const second = read('owner', 2);
  const cancelled = read('owner', 3, () => focused);
  const fourth = read('owner', 4);
  await flush();
  expect(fetchStatus.mock.calls).toEqual([
    ['owner', 1],
    ['owner', 2],
  ]);
  focused = false;
  completions[0]();
  await flush();
  expect(fetchStatus.mock.calls).toEqual([
    ['owner', 1],
    ['owner', 2],
    ['owner', 4],
  ]);
  expect(await cancelled).toBeNull();
  completions[1]();
  completions[2]();
  await expect(Promise.all([first, second, fourth])).resolves.toEqual([
    {seq: 1, status: 'sent'},
    {seq: 2, status: 'sent'},
    {seq: 4, status: 'sent'},
  ]);
});

test('rejects missing owner and invalid report IDs without requesting data', async () => {
  const fetchStatus = jest.fn();
  const read = createReportEmailStatusReader(fetchStatus);
  for (const [owner, seq] of [
    [null, 1],
    ['owner', 0],
    ['owner', 'invalid'],
    ['owner', 1.5],
  ]) {
    expect(await read(owner, seq)).toBeNull();
  }
  expect(fetchStatus).not.toHaveBeenCalled();
});

test('a failed request releases the queue and returns unavailable', async () => {
  const fetchStatus = jest
    .fn()
    .mockRejectedValueOnce(new Error('network'))
    .mockResolvedValueOnce({seq: 2});
  const read = createReportEmailStatusReader(fetchStatus, 1);
  await expect(
    Promise.all([read('owner', 1), read('owner', 2)]),
  ).resolves.toEqual([null, {seq: 2}]);
});
