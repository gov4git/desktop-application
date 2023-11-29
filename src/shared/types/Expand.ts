export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

// expands object types recursively
export type ExpandRecursive<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursive<O[K]> }
    : never
  : T

export type ExpandWithFunctions<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : T extends infer O
    ? { [K in keyof O]: O[K] }
    : never

export type ExpandRecursiveWithFunctions<T> = T extends (
  ...args: infer A
) => infer R
  ? (...args: ExpandRecursive<A>) => ExpandRecursive<R>
  : T extends object
    ? T extends infer O
      ? { [K in keyof O]: ExpandRecursive<O[K]> }
      : never
    : T
