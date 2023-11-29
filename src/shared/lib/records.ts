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
  keys: Array<string | string[]>,
): [boolean, string[]] {
  const missingKeys: string[] = []
  let pass = true
  for (const k of keys) {
    const p = Array.isArray(k) ? k : k.split('.')
    const value = objectPath.get(obj, p, undefined)
    if (
      value === undefined ||
      (typeof value === 'string' && (value as string).trim() === '')
    ) {
      pass = false
      missingKeys.push(p.join('#'))
    }
  }

  return [pass, missingKeys]
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
