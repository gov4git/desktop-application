class EventBus extends EventTarget {
  constructor() {
    super()
  }
  public emit = (event: string, details?: Record<string, unknown>) => {
    // fire event directly on the class
    this.dispatchEvent(
      new CustomEvent(event, {
        detail: details ?? {},
      }),
    )
  }

  public subscribe = (
    event: string,
    fn: (e: CustomEvent<any>) => void | Promise<void>,
  ) => {
    this.addEventListener(event, fn as EventListenerOrEventListenerObject)
    return () => {
      this.removeEventListener(event, fn as EventListenerOrEventListenerObject)
    }
  }
}

export const eventBus = new EventBus()
