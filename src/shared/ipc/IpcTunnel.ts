import type { ServiceId } from '../services/index.js'

export type InvokeServiceProps = {
  service: ServiceId
  method: string
  args: unknown[]
}

export type IpcTunnel = {
  invokeService: (invokeProps: InvokeServiceProps) => Promise<unknown>
}
