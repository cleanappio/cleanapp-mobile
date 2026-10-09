export const objectPromiseAll = async <
  T extends Record<string, Promise<unknown>>,
>(
  obj: T,
): Promise<{[K in keyof T]: Awaited<T[K]>}> => {
  const resolvedEntries = await Promise.all(
    Object.entries(obj).map(async ([key, promise]) => [key, await promise] as const),
  );

  return Object.fromEntries(resolvedEntries) as {[K in keyof T]: Awaited<T[K]>};
};
