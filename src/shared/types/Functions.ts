// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Promisify<T> = T extends Promise<any> ? T : Promise<T>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Newable = new (...args: any[]) => any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbstractNewable = abstract new (...args: any[]) => any
