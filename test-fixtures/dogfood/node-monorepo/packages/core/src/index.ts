export function createStore() {
  const data: Record<string, unknown> = {};
  return {
    get: (key: string) => data[key],
    set: (key: string, value: unknown) => { data[key] = value; },
  };
}
