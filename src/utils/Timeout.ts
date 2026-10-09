export default function timeoutSignal(timeout: number) {
  if (!Number.isInteger(timeout)) {
    throw new TypeError(`Expected an integer, got ${typeof timeout}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  controller.signal.addEventListener(
    'abort',
    () => {
      clearTimeout(timeoutId);
    },
    {once: true},
  );

  return controller.signal;
}
