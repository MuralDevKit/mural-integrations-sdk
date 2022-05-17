export const createFakeStorage = (map: Map<string, string>): Storage =>
  ({
    clear: () => {
      map.clear();
    },
    getItem: (key: string) => {
      return map.get(key) || null;
    },
    length: map.size,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  } as Storage);
