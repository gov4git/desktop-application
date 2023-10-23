export function debounceAsync<X extends (...args: any) => Promise<any>>(
  fn: X,
  delay = 100,
): (...args: Parameters<typeof fn>) => Promise<Awaited<ReturnType<typeof fn>>> {
  let existingPromise: Promise<ReturnType<typeof fn>> | null = null
  let timer: NodeJS.Timeout
  function generatePromise(...args: Parameters<typeof fn>) {
    existingPromise = new Promise<ReturnType<typeof fn>>((res, rej) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        // @ts-expect-error error
        res(fn(...args))
      }, delay)
    })
    return existingPromise.then((r) => {
      existingPromise = null
      return r
    })
  }

  return async (...args: Parameters<typeof fn>) => {
    if (existingPromise != null) return await existingPromise
    return await generatePromise(...args)
  }
}
