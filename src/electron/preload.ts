import { contextBridge, ipcRenderer } from 'electron'

import type { InvokeServiceProps, IpcTunnel } from '~/shared'

const ipcTunnel: IpcTunnel = {
  async invokeService(invokeProps: InvokeServiceProps) {
    return await ipcRenderer.invoke('serviceHandler', invokeProps)
  },
}

contextBridge.exposeInMainWorld('ipcTunnel', ipcTunnel)
