import objectPath from 'object-path'

export function clone<T = any>(obj: T): T {
  return structuredClone(obj)
}

export function createNestedRecord<T extends Record<string, unknown>>(
  record: Record<string, unknown>,
): T {
  const obj = {}
  for (const key in record) {
    objectPath.set(obj, key, record[key])
  }
  return obj as T
}

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

export function hasRequiredKeys(
  obj: Record<string, any>,
  keys: string[],
): boolean {
  for (const k of keys) {
    if (obj[k] == null || obj[k].trim() === '') {
      return false
    }
  }

  return true
}
