import timeoutSignal from '../src/utils/Timeout';

describe('timeoutSignal', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('aborts the signal after the timeout elapses', () => {
    jest.useFakeTimers();

    const signal = timeoutSignal(25);

    expect(signal.aborted).toBe(false);

    jest.advanceTimersByTime(25);

    expect(signal.aborted).toBe(true);
  });

  test('rejects non-integer timeout values', () => {
    expect(() => timeoutSignal(2.5)).toThrow(TypeError);
  });
});
