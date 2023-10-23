import { webcrypto } from 'node:crypto'
import { homedir } from 'node:os'
import { resolve } from 'node:path'

export function toResolvedPath(path: string): string {
  return resolve(path.replace('~', homedir()))
}

export async function hashString(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value)
  const hashBuffer = await webcrypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const configNameHash = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return configNameHash
}
