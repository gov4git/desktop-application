export function serialAsync<X extends (...args: any) => Promise<any>>(
  fn: X,
): (...args: Parameters<typeof fn>) => Promise<Awaited<ReturnType<typeof fn>>> {
  const existingPromises: Record<string, Promise<ReturnType<typeof fn>> | null> = {}
  function generatePromise(...args: Parameters<typeof fn>) {
    const key = JSON.stringify(args)
    // @ts-expect-error error
    existingPromises[key] = fn(...args)
    // existingPromises[key] = new Promise<ReturnType<typeof fn>>((res) => {
    //   if (timer) clearTimeout(timer)
    //   timer = setTimeout(() => {
    //     // @ts-expect-error error
    //     res(fn(...args))
    //   }, delay)
    // })
    return existingPromises[key]!.then((r) => {
      existingPromises[key] = null
      return r
    })
  }

  return async (...args: Parameters<typeof fn>) => {
    const key = JSON.stringify(args)
    if (existingPromises[key] != null) return await existingPromises[key]
    return await generatePromise(...args)
  }
}
