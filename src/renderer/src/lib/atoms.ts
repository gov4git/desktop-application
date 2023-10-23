import { atom } from 'jotai'

export const atomWithLocalStorage = <T>(key: string, initialValue: T) => {
  const getInitialValue = (): T => {
    const item = localStorage.getItem(key)
    if (item !== null) {
      return JSON.parse(item) as T
    }
    return initialValue
  }
  const baseAtom = atom(getInitialValue())
  const derivedAtom = atom<T, [T | ((arg: T) => T)], void>(
    (get) => {
      return get(baseAtom)
    },
    (get, set, update) => {
      const nextValue =
        // @ts-expect-error will use function and not constructor
        typeof update === 'function' ? update(get(baseAtom)) : update
      set(baseAtom, nextValue)
      localStorage.setItem(key, JSON.stringify(nextValue))
    },
  )
  return derivedAtom
}
