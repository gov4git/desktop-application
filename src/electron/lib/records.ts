import objectPath from 'object-path'

export function isRecord(obj: unknown): obj is Record<string, unknown> {
  return obj != null && typeof obj === 'object' && !Array.isArray(obj)
}

export function mergeDeep<T extends Record<string, unknown> = any>(
  target: unknown,
  ...sources: unknown[]
): T {
  if (!isRecord(target)) {
    throw new Error('Cannot merge. Target is not mergable.')
  }

  if (sources.length === 0) return target as T
  const source = sources.shift()

  if (isRecord(source)) {
    for (const key in source) {
      if (isRecord(source[key])) {
        if (!(key in target)) Object.assign(target, { [key]: {} })
        if (!isRecord(target[key])) {
          Object.assign(target, { [key]: source[key] })
        } else {
          mergeDeep(target[key], source[key])
        }
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources) as T
}

export function hasRequiredKeys<T extends Record<string, any>>(
  obj: T,
  keys: string[],
): boolean {
  for (const k of keys) {
    if (
      objectPath.get(
        obj,
        (k as string).split('.').map((v) => v.replace(/###/g, '.')),
        undefined,
      ) === undefined
    ) {
      return false
    }
  }

  return true
}
