import { Promisify } from '../types/Functions.js'

export type ServiceId =
  | 'ballots'
  | 'config'
  | 'user'
  | 'git'
  | 'gov4git'
  | 'log'
  | 'db'
  | 'appUpdater'
  | 'community'
  | 'settings'
  | 'cache'

export type ObjectProxy<T> = {
  [P in keyof T]: ServiceProxy<T[P]>
}

export type ServiceProxy<T> = T extends
  | (new (...args: infer TArguments) => infer TInstance)
  | (abstract new (...args: infer TArguments) => infer TInstance)
  ? new (...args: TArguments) => ServiceProxy<TInstance>
  : T extends (...args: infer TArguments) => infer TReturn
    ? (...args: TArguments) => ServiceProxy<TReturn>
    : T extends object
      ? ObjectProxy<T>
      : Promisify<T>
