import { InvokeServiceProps, ServiceId } from '~/shared'
import { isRecord } from '~/shared'

export class Services {
  protected declare services: Record<string, unknown>

  constructor() {
    this.services = {}
  }

  protected isRegistered = (id: ServiceId): boolean => {
    return id in this.services
  }

  protected getService = <T>(id: ServiceId): T => {
    if (!this.isRegistered(id)) {
      throw new Error(`Service with id ${id} is not registered`)
    }
    return this.services[id]! as T
  }

  public register = <T>(id: ServiceId, service: T) => {
    if (this.isRegistered(id)) {
      throw new Error(
        `Service by the id ${id} is already registered. Services must have a globally unique id`,
      )
    }
    this.services[id] = service
  }

  public load = <T>(id: ServiceId): T => {
    return this.getService<T>(id)
  }

  public invoke = async ({
    service: id,
    method,
    args,
  }: InvokeServiceProps): Promise<unknown> => {
    const service = this.getService(id)

    if (!isRecord(service)) {
      throw new Error(
        `Service ${service} is not an indexable type. Services are expected to be of type Record<string, Function>`,
      )
    }

    if (!(method in service) || typeof service[method] !== 'function') {
      throw new Error(`Service, ${id} does not contain method ${method}.`)
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    return await Promise.resolve((service[method]! as Function)(...args))
  }
}
