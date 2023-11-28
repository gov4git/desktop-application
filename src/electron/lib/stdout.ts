export function parseStdout<T>(cmd: string[], stdout: string): T {
  try {
    if (stdout.trim() === '') return '' as T
    return JSON.parse(stdout ?? '')
  } catch (ex) {
    throw new Error(`Unable to parse stdout for command: ${cmd.join(' ')}`)
  }
}
