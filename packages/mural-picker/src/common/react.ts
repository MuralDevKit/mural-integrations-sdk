export type ReactSlot<T = void> =
  | (T extends React.Component
      ? React.ComponentType<T['props']>
      : T extends React.FC<infer Props>
      ? React.FC<Props>
      : T extends void
      ? React.ComponentType
      : React.ComponentType<T>)
  | (() => JSX.Element);
