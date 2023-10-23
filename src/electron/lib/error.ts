export function throwIfError(err?: string) {
  if (err != null && err.trim() !== '') {
    throw new Error(err)
  }
}
