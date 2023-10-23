import type {
  AbstractNewable,
  Newable,
  ServiceId,
  ServiceProxy,
} from '~/shared'

import { serviceHandler } from './serviceHandler.js'

export function proxyService<T extends Newable | AbstractNewable>(
  serviceId: ServiceId,
): ServiceProxy<T> {
  // @ts-expect-error need to use function over () => {} for it to be constructable
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return new Proxy(function () {}, {
    construct() {
      return new Proxy(
        {},
        {
          get(target: Record<string, unknown>, name: string) {
            if (target[name] != null) {
              return target[name]
            }
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            return new Proxy(function () {}, {
              async apply(target, thisArg, args) {
                return await serviceHandler({
                  service: serviceId,
                  method: name as string,
                  args,
                })
              },
            })
          },
          set(target: Record<string, unknown>, prop: string, value) {
            target[prop] = value
            return true
          },
        },
      )
    },
  }) as ServiceProxy<T>
}
