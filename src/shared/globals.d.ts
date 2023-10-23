import { IpcTunnel } from './ipc/index.js'

declare global {
  interface Window {
    ipcTunnel: IpcTunnel
  }
}
