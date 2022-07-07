export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type EventHandler<T = void, TReturn = void> = T extends void
  ? () => Promise<TReturn> | TReturn
  : T extends any[]
  ? (...args: T) => Promise<TReturn> | TReturn
  : never;
