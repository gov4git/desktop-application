export function serialAsync<X extends (...args: any) => Promise<any>>(
  fn: X,
): (...args: Parameters<typeof fn>) => Promise<Awaited<ReturnType<typeof fn>>> {
  const existingPromises: Record<
    string,
    Promise<ReturnType<typeof fn>> | null
  > = {}
  function generatePromise(...args: Parameters<typeof fn>) {
    const key = JSON.stringify(args)
    // @ts-expect-error error
    existingPromises[key] = fn(...args)
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

export function debounceAsync<X extends (...args: any) => any>(
  fn: X,
  delay = 200,
): (
  ...args: Parameters<X>
) => ReturnType<X> extends Promise<any>
  ? Promise<Awaited<ReturnType<X>>>
  : Promise<ReturnType<X>> {
  let timer: NodeJS.Timeout | null = null
  const promises: {
    p: ReturnType<X> extends Promise<any>
      ? DeferredPromise<Awaited<ReturnType<X>>> | null
      : DeferredPromise<ReturnType<X>> | null
  } = {
    p: null,
  }

  return async (...args: Parameters<X>) => {
    if (timer != null) clearTimeout(timer)
    promises.p = promises.p ?? new DeferredPromise<any>()
    timer = setTimeout(async () => {
      try {
        // @ts-expect-error error
        const result = await Promise.resolve(fn(...args))
        promises.p!.resolve(result)
      } catch (ex) {
        promises.p!.reject(new Error(`${ex}`))
      }
      promises.p = null
    }, delay)
    return promises.p.promise as any
  }
}

export class DeferredPromise<T> {
  public declare promise: Promise<T>
  public declare resolve: (value: T | PromiseLike<T>) => void
  public declare reject: (value?: any) => void
  constructor() {
    this.promise = new Promise((res, rej) => {
      this.resolve = res
      this.reject = rej
    })
  }
}
