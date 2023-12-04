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
    const events = event.replace(/\s/g, '').split(',')
    for (const e of events) {
      this.addEventListener(e, fn as EventListenerOrEventListenerObject)
    }
    return () => {
      for (const e of events) {
        this.removeEventListener(e, fn as EventListenerOrEventListenerObject)
      }
    }
  }
}

export const eventBus = new EventBus()
