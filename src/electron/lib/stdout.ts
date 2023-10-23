export function parseStdout<T>(cmd: string[], stdout: string): T {
  try {
    return JSON.parse(stdout) as T
  } catch (ex) {
    throw new Error(`Unable to parse stdout for command: ${cmd.join(' ')}`)
  }
}
