export type EventHandler<T = void> = (args: T) => Promise<void> | void;
